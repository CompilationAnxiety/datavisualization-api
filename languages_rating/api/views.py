
import datetime
import json
import time
import urllib.request
from datetime import *

import requests
from bs4 import BeautifulSoup
from django.db import models
from django.db.models import Max, Min
from django.http import HttpResponse, JsonResponse
from parse import *
from rest_framework import status, viewsets
from rest_framework.decorators import list_route
from rest_framework.parsers import JSONParser
from rest_framework.renderers import JSONRenderer
from rest_framework.response import Response

from languages_rating.api.models import (Event, Language, LanguageData, LanguageJSON, LanguageXML)
from languages_rating.api.serializers import (EventDataSerializer, LanguageDataSerializer, LanguageSerializer)

class LanguageDataViewSet(viewsets.ModelViewSet):
    queryset = LanguageData.objects.all()
    serializer_class = LanguageDataSerializer
    
    @list_route(methods = ['get'])
    def load_languages_data(self, request):
        url = "https://www.tiobe.com/tiobe-index"
        html = str(BeautifulSoup(requests.session().get(url).text, 'html.parser'))
        html = search("series{}<iframe", html).fixed[0]

        LanguageData.objects.all().delete()
        Language.objects.all().delete()

        # finding minyear, minmonth, maxyear, maxmonth
        minyear = datetime.MAXYEAR
        minmonth = 11
        maxyear = datetime.MINYEAR
        maxmonth = 0
        for result in findall("data : {language_data}}", html):
            first_date = search("[Date.UTC({min_date}),", result["language_data"])
            last_date = search("UTC({max_date}), {}]]", result["language_data"][result["language_data"].rfind('Date.UTC'):])
            min_year, min_month, _ = map(int, first_date["min_date"].split(', '))
            max_year, max_month, _ = map(int, last_date["max_date"].split(', '))
            if min_year <= minyear:
                minyear = min_year
                if min_month < minmonth:
                    minmonth = min_month
            if max_year >= maxyear:
                maxyear = max_year
                if max_month > maxmonth:
                    maxmonth = max_month

        minmonth += 1         
        maxmonth += 1  
        
        #
        for result in findall("name : {language_name},data : [[{}]]", html):
            language = Language(name=result["language_name"])
            language.save()

        # creating array with all possible date values
        dates = []
        for year in range(minyear, maxyear+1):
            min_month = 1
            max_month = 12
            if year == minyear:
                min_month = minmonth
            if year == maxyear:
                max_month = maxmonth
            for month in range(min_month, max_month+1):
                dates.append(dict(year=year, month=month))

        # creating all instances with popularity = None
        for language in Language.objects.all():
            LanguageData.objects.bulk_create([
                LanguageData(   date=date(year=_date['year'], month=_date['month'], day=1),  
                                language = language) for _date in dates        
            ])
        
        # rewrite popularity if there is data
        for result in findall("name : {language_name},data : [{language_data}}", html):
            print(result["language_name"])
            for point_data in findall("[Date.UTC({language_date}), {language_percent}]", result["language_data"]):
                year, month, _ = map(int, point_data["language_date"].split(', '))
                lang_data = LanguageData.objects.filter(date = date(year=year, month=month+1, day=1), language = Language.objects.get(name=result["language_name"]).id)[0]
                lang_data.popularity = point_data["language_percent"]
                lang_data.save()

        # removing unused data
        for _date in dates:
            count = 0
            for lang_data in LanguageData.objects.filter(date = date(year=_date['year'], month=_date['month'], day=1)):
                if lang_data.popularity == None:
                    count += 1
            if count == Language.objects.count():
                LanguageData.objects.filter(date = date(year=_date['year'], month=_date['month'], day=1)).delete()
        
        # converting data into json and xml
        self.updateXML()
        self.updateJSON()
        response = {"message": "Data was saved in the database"}
        return Response(response, status = status.HTTP_200_OK)

    @list_route(methods = ['get'])
    def get_languages_data(self, request):
        if request.GET['type'] == 'json' :
            if LanguageJSON.objects.all().count() == 0:
                self.updateJSON()
            return HttpResponse(LanguageJSON.objects.first().json, content_type='application/json') 
        
        elif request.GET['type'] == 'xml' :
            if LanguageXML.objects.all().count() == 0:
                self.updateXML()
            return Response(LanguageXML.objects.first().xml, status = status.HTTP_200_OK) 
        
        else :
            response = {"message": "error occured"}
            return Response(response, status = status.HTTP_200_OK)

    def updateXML(self):
        serializer = LanguageDataSerializer()
        data = serializer.xml_serialize()
        if LanguageXML.objects.all().count() != 0:
            LanguageXML.objects.all().delete()
        LanguageXML.objects.create(xml = data)

    def updateJSON(self):
        serializer = LanguageDataSerializer()
        data = serializer.json_serialize()
        if LanguageJSON.objects.all().count() != 0:
            LanguageJSON.objects.first().delete()
        LanguageJSON.objects.create(json = data)

class EventDataViewSet(viewsets.ModelViewSet):
    queryset = Event.objects.all()
    serializer_class = EventDataSerializer
    
    @list_route(methods = ['post'])
    def send_events(self, request):
        events_list = json.loads(request.body.decode('utf-8'))
        for event in events_list:
            print('event: ', event)
            if not Event.objects.filter(name=event['name'], year = event['year'], month = event['month'], event_type = event['event_type']).exists():
                Event.objects.create(name=event['name'], year = event['year'], month = event['month'], event_type = event['event_type'])

        return Response('Events was saved in the database', status = status.HTTP_200_OK) 