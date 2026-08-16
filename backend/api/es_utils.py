# Elasticsearch Utils
import os
from elasticsearch import Elasticsearch

es = Elasticsearch([os.environ.get('ELASTICSEARCH_URL')])

def create_index():
    if not es.indices.exists(index="tickets"):
        mapping = {
            "mappings": {
                "properties": {
                    "ticket_id": {"type": "integer"},
                    "sport_type": {"type": "keyword"},
                    "home_team": {"type": "text", "analyzer": "standard"},
                    "away_team": {"type": "text", "analyzer": "standard"},
                    "venue_city": {"type": "keyword"},
                    "price": {"type": "double"},
                    "ticket_date_time": {"type": "date"},
                    "suggest": {"type": "completion"}
                }
            }
        }
        es.indices.create(index="tickets", body=mapping)

def index_ticket(ticket_data):
    doc = {
        "ticket_id": ticket_data['ticket_id'],
        "sport_type": ticket_data['sport_type'],
        "home_team": ticket_data['home_team'],
        "away_team": ticket_data['away_team'],
        "venue_city": ticket_data['venue_city'],
        "price": float(ticket_data['price']),
        "ticket_date_time": ticket_data['ticket_date_time'],
        "suggest": {
            "input": [ticket_data['home_team'], ticket_data['away_team'], ticket_data['venue_city']]
        }
    }
    es.index(index="tickets", id=str(ticket_data['ticket_id']), body=doc)

def delete_ticket_es(ticket_id):
    if es.exists(index="tickets", id=str(ticket_id)):
        es.delete(index="tickets", id=str(ticket_id))

def search_tickets_es(params):
    must_clauses = []
    
    if 'sport_type' in params:
        must_clauses.append({"term": {"sport_type": params['sport_type']}})
    if 'city' in params:
        must_clauses.append({"term": {"venue_city": params['city']}})
    if 'team' in params:
        must_clauses.append({
            "multi_match": {
                "query": params['team'],
                "fields": ["home_team", "away_team"]
            }
        })
    if 'min_price' in params or 'max_price' in params:
        price_range = {}
        if 'min_price' in params:
            price_range["gte"] = float(params['min_price'])
        if 'max_price' in params:
            price_range["lte"] = float(params['max_price'])
        must_clauses.append({"range": {"price": price_range}})

    query = {"query": {"bool": {"must": must_clauses}}} if must_clauses else {"query": {"match_all": {}}}
    
    res = es.search(index="tickets", body=query)
    return [hit['_source'] for hit in res['hits']['hits']]

def autocomplete_es(text):
    query = {
        "suggest": {
            "ticket_suggest": {
                "prefix": text,
                "completion": {
                    "field": "suggest",
                    "fuzzy": {"fuzziness": 1}
                }
            }
        }
    }
    res = es.search(index="tickets", body=query)
    suggestions = []
    if res['suggest']['ticket_suggest'][0]['options']:
        for option in res['suggest']['ticket_suggest'][0]['options']:
            suggestions.append(option['_source'])
    return suggestions