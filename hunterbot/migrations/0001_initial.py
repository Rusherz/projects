# -*- coding: utf-8 -*-
# Generated by Django 1.11.2 on 2017-06-02 17:24
from __future__ import unicode_literals

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Region',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('RegionId', models.IntegerField()),
                ('RegionName', models.CharField(max_length=255)),
            ],
        ),
        migrations.CreateModel(
            name='SysInfo',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('NPCKills', models.IntegerField()),
                ('NPCDelta', models.IntegerField()),
                ('PlayerKills', models.IntegerField()),
                ('PodKills', models.IntegerField()),
                ('Index', models.DecimalField(decimal_places=1, max_digits=5)),
            ],
        ),
        migrations.CreateModel(
            name='System',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('SystemId', models.IntegerField()),
                ('SystemName', models.CharField(max_length=255)),
                ('Region', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='hunterbot.Region')),
            ],
        ),
        migrations.AddField(
            model_name='sysinfo',
            name='System',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='hunterbot.System'),
        ),
    ]
