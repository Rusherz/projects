# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models


# Create your models here.
class Region(models.Model):
    RegionId = models.IntegerField()
    RegionName = models.CharField(max_length=255)


class System(models.Model):
    Region = models.ForeignKey(Region)
    SystemId = models.IntegerField()
    SystemName = models.CharField(max_length=255)


class SysInfo(models.Model):
    System = models.ForeignKey(System)
    NPCKills = models.IntegerField()
    NPCDelta = models.IntegerField()
    PlayerKills = models.IntegerField()
    PodKills = models.IntegerField()
    Index = models.DecimalField(max_digits=5, decimal_places=1)
