# Generated by Django 2.0.3 on 2018-05-16 08:04

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0007_language_offset'),
    ]

    operations = [
        migrations.AlterField(
            model_name='languagedata',
            name='popularity',
            field=models.FloatField(null=True),
        ),
    ]
