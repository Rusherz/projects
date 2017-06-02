# -*- coding: utf-8 -*-
from __future__ import unicode_literals
from django.shortcuts import render, redirect
from django.shortcuts import render
from django.http import HttpResponse
from .models import Region, System, SysInfo

import requests
import json
import csv

# Create your views here.
def GetSovInfo(request):
    headers= {
            'User-Agent': 'rusherz ieatrusherz34@gmail.com',
            'Accept': 'application/json',
            'Host': 'esi.tech.ccp.is'
        }
    url = 'https://esi.tech.ccp.is/latest/sovereignty/structures/'
    data = json.loads(requests.get(url, headers=headers).content)
    for sysData in data:
        system = System.objects.get(SystemId=sysData['solar_system_id'])
        # sysinfo = SysInfo(System=system, NPCKills=sysData['npc_kills'], NPCDelta=0,
        #                  PlayerKills=(sysData['npc_kills'] - sysData['ship_kills']), PodKills=sysData['pod_kills'])
        if 'vulnerability_occupancy_level' not in sysData:
            sysinfo, created = SysInfo.objects.update_or_create(System=system)
            sysinfo.Index = 0;
            sysinfo.save()
        else:
            sysinfo, created = SysInfo.objects.update_or_create(System=system)
            sysinfo.Index = ("%.2f" % sysData['vulnerability_occupancy_level'])
            sysinfo.save()

    return HttpResponse('done')


def GetSysInfo(request):
    headers= {
            'User-Agent': 'rusherz ieatrusherz34@gmail.com',
            'Accept': 'application/json',
            'Host': 'esi.tech.ccp.is'
        }
    url = 'https://esi.tech.ccp.is/latest/universe/system_kills/'
    data = json.loads(requests.get(url, headers=headers).content)
    for sysData in data:
        system = System.objects.get(SystemId=sysData['system_id'])
        sysInfo, created = SysInfo.objects.update_or_create(System=system)
        sysInfo.NPCKills = sysData['npc_kills']
        sysInfo.PlayerKills = (sysData['npc_kills'] - sysData['ship_kills'])
        sysInfo.PodKills = sysData['pod_kills']

        sysInfo.save()

    return HttpResponse('done')
