from rest_framework.response import Response
from rest_framework.decorators import api_view
from .models import Visitor
from .serializers import VisitorSerializer

@api_view(["POST"])  # ✅ Allow only POST requests
def track_visit(request):
    data = request.data  # Get JSON data from frontend
    print("Received Tracking Data:", data)  # Debugging

    ip = data.get('ip')
    if not ip:
        return Response({"error": "IP address is required"}, status=400)

    # Fetch or create visitor record
    visitor, created = Visitor.objects.get_or_create(ip=ip, defaults={
        "city": data.get('city', ''),
        "region": data.get('region', ''),
        "country": data.get('country_name', ''),
        "postal_code": data.get('postal', ''),
        "timezone": data.get('timezone', ''),
        "browser": data.get('browser', ''),
        "language": data.get('language', ''),
        "device_type": data.get('deviceType', ''),
        "screen_resolution": data.get('screenResolution', ''),
        "referrer": data.get('referrer', ''),
        "total_clicks": data.get('clicks', 0),
        "total_time_spent": data.get('timeSpent', 0),
        "total_visits": 1,  # Set first visit count
    })

    if not created:
        visitor.total_visits += 1
        visitor.total_clicks += data.get('clicks', 0)
        visitor.total_time_spent += data.get('timeSpent', 0)
        visitor.save()

    return Response({"message": "Data received successfully!", "visitor": VisitorSerializer(visitor).data}, status=200)
