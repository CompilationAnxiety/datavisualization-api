from django.db import models

class Language(models.Model):
    name = models.CharField(max_length=30)

    def natural_key(self):
        return self.name

    def __str__(self):
        return self.name

class LanguageData(models.Model):
    date = models.DateField(blank=True, null=True)
    popularity = models.FloatField(null=True)
    language = models.ForeignKey(Language, on_delete=models.PROTECT)

    def __str__(self):
        return str(self.id)

class LanguageXML(models.Model):
    xml = models.TextField()

    def __str__(self):
        return self.xml
    
class LanguageJSON(models.Model):
    json = models.TextField()

    def __str__(self):
        return self.json

class Event(models.Model):
    name = models.CharField(max_length=30)
    year = models.IntegerField()
    month = models.IntegerField()
    event_type = models.CharField(max_length=20)

    def __str__(self):
        return self.name

    def jsonDefault(object):
        return object.__dict__