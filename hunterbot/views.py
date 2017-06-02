# -*- coding: utf-8 -*-
from __future__ import unicode_literals
from django.shortcuts import render, redirect
from django.shortcuts import render
from django.http import HttpResponse

import requests
import json

# Create your views here.
def index(request):
    headers= {
            'User-Agent': 'rusherz ieatrusherz34@gmail.com',
            'Accept': 'application/json',
            'Host': 'esi.tech.ccp.is'
        }
    url = 'https://esi.tech.ccp.is/latest/sovereignty/structures/'
    return HttpResponse(requests.get(url, headers=headers).content)
