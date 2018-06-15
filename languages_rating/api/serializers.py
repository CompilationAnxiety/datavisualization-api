
import json
from xml.etree import ElementTree as ET
from django.core import serializers as ser
from rest_framework import serializers
from languages_rating.api.models import Language, LanguageData, Event

class LanguageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Language
        fields = ('name',)

class EventDataSerializer(serializers.ModelSerializer):
    class Meta:
        model = Event
        fields = ('name', 'year', 'month', 'event_type', )

class LanguageDataSerializer(serializers.ModelSerializer):
    language = serializers.SlugRelatedField(
        read_only=True,
        slug_field='name'
    )
    class Meta:
        model = LanguageData
        fields = ('date', 'popularity', 'language',)

    def json_serialize(self):
        return json.dumps([{'language': language.name,
                            'data' : [{ 
                                'date': str(data.date), 
                                'popularity': str(data.popularity)} 
                            for data in LanguageData.objects.filter(language = language)]} 
                        for language in Language.objects.all()])

    def xml_serialize(self):
        result = ET.Element('data') 
        for language in Language.objects.all():

            lang = ET.SubElement(result, 'language')
            lang.text = str(language.name)

            for language_data in LanguageData.objects.filter(language = language): 

                item = ET.SubElement(lang, 'item')  
                date_item = ET.SubElement(item, 'date')  
                popularity_item = ET.SubElement(item, 'popularity')
                date_item.text = str(language_data.date)
                popularity_item.text = str(language_data.popularity)

        return ET.tostring(result) 
