import { useState } from "react";
import { MapPin, Clock, Target, Phone, Navigation } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function SelectRoutePage({ onStartRoute }) {
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [expanded, setExpanded] = useState(null);

  const availableRoutes = [
    {
      id: "route001",
      hotel: "The Taj Palace",
      hotelAddress: "Chanakyapuri, New Delhi",
      hotelPhone: "+91 9876543210",
      recipient: "Night Shelter A",
      recipientAddress: "Sector 18, Delhi",
      recipientPhone: "+91 9123456780",
      estimatedEarnings: 190,
      estimatedTime: "40 mins",
      difficulty: "Moderate",
      priority: "High",
    },
    {
      id: "route002",
      hotel: "JW Marriott",
      hotelAddress: "Aerocity, New Delhi",
      hotelPhone: "+91 9988776655",
      recipient: "Worker Camp Sector 45",
      recipientAddress: "Sector 45, Gurgaon",
      recipientPhone: "+91 9345678901",
      estimatedEarnings: 250,
      estimatedTime: "45 mins",
      difficulty: "Easy",
      priority: "Normal",
    },
  ];

  const openInMaps = (location) => {
    const query = encodeURIComponent(location);
    window.open(
      `https://www.google.com/maps/search/?api=1&query=${query}`,
      "_blank"
    );
  };

  const navigateRoute = (pickup, drop) => {
    const origin = encodeURIComponent(pickup);
    const destination = encodeURIComponent(drop);
    window.open(
      `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}`,
      "_blank"
    );
  };

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <Badge className="bg-[var(--green-primary)]/10 text-[var(--green-primary)]">
          {availableRoutes.length} deliveries available
        </Badge>
      </div>

      <div className="grid gap-6">
        {availableRoutes.map((route) => (
          <Card
            key={route.id}
            className={`transition rounded-2xl border hover:shadow-lg ${
              selectedRoute === route.id
                ? "ring-2 ring-[var(--green-primary)]"
                : ""
            }`}
          >
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                <div>
                  <CardTitle>
                    Delivery #{route.id.slice(-3).toUpperCase()}
                  </CardTitle>
                  
                </div>

                <div className="text-left sm:text-right">
                  <div className="text-xl sm:text-2xl font-bold text-[var(--green-primary)]">
                    ₹{route.estimatedEarnings}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Est. earnings
                  </div>
                </div>
              </div>
            </CardHeader>

            <CardContent>
              {/* Responsive Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                {/* Pickup */}
                <div>
                  <h5 className="font-medium mb-2 flex items-center">
                    <MapPin className="w-4 h-4 mr-2 text-green-600" />
                    Pickup
                  </h5>

                  <div
                    onClick={() => openInMaps(route.hotelAddress)}
                    className="cursor-pointer text-sm hover:text-green-600 transition"
                  >
                    {route.hotel}
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-2 p-0 h-auto text-xs"
                    onClick={() =>
                      setExpanded(
                        expanded === route.id + "-pickup"
                          ? null
                          : route.id + "-pickup"
                      )
                    }
                  >
                    View Details
                  </Button>

                  {expanded === route.id + "-pickup" && (
                    <div className="mt-2 p-3 bg-gray-50 rounded-xl text-xs space-y-2">
                      <p>📍 {route.hotelAddress}</p>
                      <div className="flex items-center justify-between">
                        <span>📞 {route.hotelPhone}</span>
                        <Phone
                          className="w-4 h-4 cursor-pointer text-green-600"
                          onClick={() =>
                            (window.location.href = `tel:${route.hotelPhone}`)
                          }
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Drop */}
                <div>
                  <h5 className="font-medium mb-2 flex items-center">
                    <MapPin className="w-4 h-4 mr-2 text-orange-500" />
                    Drop
                  </h5>

                  <div
                    onClick={() => openInMaps(route.recipientAddress)}
                    className="cursor-pointer text-sm hover:text-orange-500 transition"
                  >
                    {route.recipient}
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-2 p-0 h-auto text-xs"
                    onClick={() =>
                      setExpanded(
                        expanded === route.id + "-drop"
                          ? null
                          : route.id + "-drop"
                      )
                    }
                  >
                    View Details
                  </Button>

                  {expanded === route.id + "-drop" && (
                    <div className="mt-2 p-3 bg-gray-50 rounded-xl text-xs space-y-2">
                      <p>📍 {route.recipientAddress}</p>
                      <div className="flex items-center justify-between">
                        <span>📞 {route.recipientPhone}</span>
                        <Phone
                          className="w-4 h-4 cursor-pointer text-orange-500"
                          onClick={() =>
                            (window.location.href = `tel:${route.recipientPhone}`)
                          }
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Route Info */}
                <div>
                  <h5 className="font-medium mb-2 flex items-center">
                    <Target className="w-4 h-4 mr-2 text-red-500" />
                    Route Info
                  </h5>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-2 text-yellow-500" />
                      {route.estimatedTime}
                    </div>

                    <div>{route.difficulty}</div>

                    <Badge
                      variant={
                        route.priority === "High"
                          ? "destructive"
                          : "secondary"
                      }
                    >
                      {route.priority} Priority
                    </Badge>

                    <Button
                      size="sm"
                      variant="outline"
                      className="mt-3 w-full"
                      onClick={() =>
                        navigateRoute(
                          route.hotelAddress,
                          route.recipientAddress
                        )
                      }
                    >
                      <Navigation className="w-4 h-4 mr-2" />
                      Navigate
                    </Button>
                  </div>
                </div>
              </div>

              {/* Select Button */}
              <div className="mt-6 flex flex-col sm:flex-row gap-3">
                <Button
                  className="flex-1"
                  variant={
                    selectedRoute === route.id ? "default" : "outline"
                  }
                  onClick={() => setSelectedRoute(route.id)}
                >
                  {selectedRoute === route.id
                    ? "Selected"
                    : "Select Delivery"}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {selectedRoute && (
        <div className="mt-8">
          <Button
            size="lg"
            className="w-full bg-[var(--green-primary)]"
            onClick={() => onStartRoute(selectedRoute)}
          >
            Start Delivery
          </Button>
        </div>
      )}
    </div>
  );
}
