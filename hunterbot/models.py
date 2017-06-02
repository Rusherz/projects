# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models


# Create your models here.
class Region(models.Model):
    RegionId = models.IntegerField(unique=True)
    RegionName = models.CharField(max_length=255)


class System(models.Model):
    Region = models.ForeignKey(Region)
    SystemId = models.IntegerField(unique=True)
    SystemName = models.CharField(max_length=255)


class SysInfo(models.Model):
    System = models.ForeignKey(System, unique=True)
    NPCKills = models.IntegerField(null=True)
    NPCDelta = models.IntegerField(null=True, default=0)
    PlayerKills = models.IntegerField(null=True)
    PodKills = models.IntegerField(null=True)
    Index = models.DecimalField(max_digits=5, decimal_places=1, null=True)
