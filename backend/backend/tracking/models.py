from django.db import models

class Visitor(models.Model):
    ip = models.GenericIPAddressField()
    city = models.CharField(max_length=100, blank=True, null=True)
    region = models.CharField(max_length=100, blank=True, null=True)
    country = models.CharField(max_length=100, blank=True, null=True)
    postal_code = models.CharField(max_length=20, blank=True, null=True)
    timezone = models.CharField(max_length=50, blank=True, null=True)
    browser = models.TextField()
    language = models.CharField(max_length=50)
    device_type = models.CharField(max_length=50)
    screen_resolution = models.CharField(max_length=20)
    referrer = models.TextField(blank=True, null=True)
    total_visits = models.IntegerField(default=1)
    total_clicks = models.IntegerField(default=0)
    total_time_spent = models.IntegerField(default=0)  # In seconds
    last_visited = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.ip} - {self.city} ({self.total_visits} visits)"
