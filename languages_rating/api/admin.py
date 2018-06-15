from django.contrib import admin
from languages_rating.api.models import Event, Language, LanguageData, LanguageXML, LanguageJSON

admin.site.register(Language)
admin.site.register(LanguageData)
admin.site.register(LanguageXML)
admin.site.register(LanguageJSON)
admin.site.register(Event)