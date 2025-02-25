from rest_framework.response import Response
from rest_framework.decorators import api_view
from .models import Visitor
from .serializers import VisitorSerializer

@api_view(["POST"])  # ✅ Allow only POST requests
def track_visit(request):
    data = request.data  # Get JSON data from frontend
    print("Received Tracking Data:", data)  # Debugging

    ip = data.get("ip", request.META.get("REMOTE_ADDR"))  # Default to request IP if missing
    if not ip:
        return Response({"error": "IP address is required"}, status=400)

    # Ensure integer values
    clicks = int(data.get("clicks", 0))
    time_spent = int(data.get("timeSpent", 0))

    # Fetch or create visitor record
    visitor, created = Visitor.objects.get_or_create(ip=ip, defaults={
        "city": data.get("city", ""),
        "region": data.get("region", ""),
        "country": data.get("country_name", ""),
        "postal_code": data.get("postal", ""),
        "timezone": data.get("timezone", ""),
        "browser": data.get("browser", ""),
        "language": data.get("language", ""),
        "device_type": data.get("deviceType", ""),
        "screen_resolution": data.get("screenResolution", ""),
        "referrer": data.get("referrer", ""),
        "total_clicks": clicks,
        "total_time_spent": time_spent,
        "total_visits": 1,  # Set first visit count
    })

    if not created:
        visitor.total_visits += 1
        visitor.total_clicks += clicks
        visitor.total_time_spent += time_spent
        visitor.save()

    return Response(
        {"message": "Data received successfully!", "visitor": VisitorSerializer(visitor).data},
        status=200,
    )
