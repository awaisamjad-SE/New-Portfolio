from django.contrib import admin
from .models import Visitor

@admin.register(Visitor)
class VisitorAdmin(admin.ModelAdmin):
    list_display = ('ip', 'city', 'region', 'country', 'total_visits', 'total_clicks', 'total_time_spent', 'last_visited')
    search_fields = ('ip', 'city', 'region', 'country')

