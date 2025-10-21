"use client"

import { useState } from "react"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  CheckCircle,
  Heart,
  Truck,
  Phone,
  MessageCircle,
  MapPin,
  Star,
  Clock,
} from "lucide-react"

export default function FoodTracking() {
  // mock state
  const [hasActiveRequest, setHasActiveRequest] = useState(true)

  // mock active request data
  const activeRequest = {
    robin: {
      name: "Aman Sharma",
      rating: 4.8,
      eta: "15 mins",
    },
    hotel: "Grace Kitchen, Andheri",
    items: ["Dal Tadka", "Jeera Rice", "Chapati", "Gulab Jamun"],
  }

  return (
    <div className="space-y-6">
      {hasActiveRequest ? (
        <>
          <div className="flex justify-between items-center">
            <h3 className="text-2xl font-bold">Active Request</h3>
            <Badge variant="default">Robin Assigned</Badge>
          </div>

          {/* Delivery Status */}
          <Card>
            <CardHeader>
              <CardTitle>Delivery Status</CardTitle>
              <CardDescription>
                Your food is being prepared and will be delivered soon
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <div className="font-medium">Request Confirmed</div>
                    <div className="text-sm text-muted-foreground">
                      Your request has been accepted
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <div className="font-medium">Robin Assigned</div>
                    <div className="text-sm text-muted-foreground">
                      {activeRequest.robin.name} will deliver your food
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center animate-pulse">
                    <Truck className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <div className="font-medium">On the Way</div>
                    <div className="text-sm text-muted-foreground">
                      ETA: {activeRequest.robin.eta}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-3 opacity-50">
                  <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                    <Heart className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div>
                    <div className="font-medium text-muted-foreground">
                      Delivered
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Pending delivery
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Robin Information */}
          <Card>
            <CardHeader>
              <CardTitle>Your Robin</CardTitle>
              <CardDescription>The person delivering your food</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                    <Truck className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <div>
                    <div className="font-semibold">{activeRequest.robin.name}</div>
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <Star className="w-3 h-3 text-yellow-500" />
                      <span>{activeRequest.robin.rating} rating</span>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <Button variant="outline" size="sm">
                    <Phone className="w-4 h-4 mr-2" />
                    Call
                  </Button>
                  <Button variant="outline" size="sm">
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Message
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Food Items */}
          <Card>
            <CardHeader>
              <CardTitle>Your Food</CardTitle>
              <CardDescription>
                Items being delivered from {activeRequest.hotel}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {activeRequest.items.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center space-x-3 p-3 bg-muted rounded-lg"
                  >
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    <span className="font-medium">{item}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium">
                    From: {activeRequest.hotel}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Active Request</h3>
            <p className="text-muted-foreground mb-4">
              You don't have any active food requests at the moment.
            </p>
            <Button onClick={() => setHasActiveRequest(true)}>
              Request Food
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
