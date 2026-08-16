from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.db import connection
from api.utils import get_user_id_from_request

@api_view(['GET', 'PATCH'])
def admin_management(request):
    user_id = get_user_id_from_request(request)
    if not user_id:
        return Response({'error': 'Unauthorized'}, status=401)

    with connection.cursor() as cursor:
        cursor.execute("SELECT role FROM users WHERE user_id = %s;", [user_id])
        role_row = cursor.fetchone()
        if not role_row or role_row[0] != 'admin':
            return Response({'error': 'Access denied.'}, status=403)

        if request.method == 'GET':
            action = request.GET.get('action', 'reports')
            
            if action == 'reports':
                cursor.execute("""
                    SELECT report_id, reservation_id, report_type, description, report_status, reported_at 
                    FROM reports ORDER BY reported_at DESC;
                """)
            elif action == 'reservations':
                cursor.execute("""
                    SELECT reservation_id, user_id, ticket_id, reservation_status, reserved_at 
                    FROM reservations ORDER BY reserved_at DESC;
                """)
            elif action == 'cancellations':
                cursor.execute("""
                    SELECT reservation_id, user_id, ticket_id, reservation_status, reserved_at 
                    FROM reservations WHERE reservation_status = 'cancelled' ORDER BY reserved_at DESC;
                """)
            elif action == 'users':
                cursor.execute("""
                    SELECT user_id, username, role 
                    FROM users ORDER BY user_id DESC;
                """)
                
            columns = [col[0] for col in cursor.description]
            data = [dict(zip(columns, row)) for row in cursor.fetchall()]
            return Response(data, status=200)

        elif request.method == 'PATCH':
            target = request.data.get('target')
            target_id = request.data.get('id')
            
            if target == 'report':
                reply = request.data.get('reply')
                status = request.data.get('status', 'resolved')
                cursor.execute("""
                    UPDATE reports SET reply = %s, report_status = %s 
                    WHERE report_id = %s RETURNING report_id;
                """, [reply, status, target_id])
            
            elif target == 'reservation':
                status = request.data.get('status')
                if status == 'cancelled':
                    cursor.execute("""
                        SELECT t.ticket_id, r.quantity, r.user_id, p.amount, r.reservation_status
                        FROM reservations r
                        JOIN tickets t ON r.ticket_id = t.ticket_id
                        LEFT JOIN payments p ON r.reservation_id = p.reservation_id
                        WHERE r.reservation_id = %s;
                    """, [target_id])
                    row = cursor.fetchone()
                    if row and row[4] != 'cancelled':
                        ticket_id, quantity, res_user_id, amount, current_status = row
                        cursor.execute("""
                            UPDATE reservations SET reservation_status = 'cancelled' 
                            WHERE reservation_id = %s RETURNING reservation_id;
                        """, [target_id])
                        cursor.execute("UPDATE tickets SET remaining_capacity = remaining_capacity + %s WHERE ticket_id = %s;", [quantity, ticket_id])
                        if current_status == 'paid' and amount:
                            cursor.execute("UPDATE users SET wallet_balance = COALESCE(wallet_balance, 0) + %s WHERE user_id = %s;", [amount, res_user_id])
                else:
                    cursor.execute("""
                        UPDATE reservations SET reservation_status = %s 
                        WHERE reservation_id = %s RETURNING reservation_id;
                    """, [status, target_id])
            
            if cursor.fetchone() or (target == 'reservation' and status == 'cancelled'):
                return Response({'message': 'Update successful'}, status=200)
            return Response({'error': 'Record not found'}, status=404)