from rest_framework.decorators import api_view
from rest_framework.response import Response
from api.es_utils import search_tickets_es, autocomplete_es, create_index

@api_view(['GET'])
def search_tickets(request):
    create_index()
    
    if 'q' in request.GET:
        results = autocomplete_es(request.GET['q'])
        return Response(results, status=200)

    params = request.GET.dict()
    results = search_tickets_es(params)
    
    return Response(results, status=200)