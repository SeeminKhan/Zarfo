"use client"

import { useState } from "react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Star, Camera } from "lucide-react"

export default function DeliveryHistory() {
  const [recentDeliveries] = useState([
    {
      id: 1,
      hotel: "Hotel Paradise",
      robin: "Aman Singh",
      date: "2025-10-15",
      items: ["Paneer Butter Masala", "Garlic Naan", "Sweet Lassi"],
      rating: 4,
      feedback: "Delicious food, nicely packed and still hot!",
    },
    {
      id: 2,
      hotel: "Ocean Breeze",
      robin: "Meena Rao",
      date: "2025-10-10",
      items: ["Grilled Fish", "Masala Fries"],
      rating: 5,
      feedback: "Excellent delivery and taste. Highly recommend!",
    },
  ])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h3 className="text-2xl font-bold text-[color:var(--text-color)]">Delivery History</h3>
        <Badge
          className="bg-[color:var(--green-light)] text-white hover:bg-[color:var(--green-primary)]"
        >
          {recentDeliveries.length} recent deliveries
        </Badge>
      </div>

      {/* Recent Deliveries */}
      <div className="space-y-4">
        {recentDeliveries.map((delivery) => (
          <Card
            key={delivery.id}
            className="bg-[color:var(--card-bg)] border border-[color:var(--green-light)]/20 shadow-sm"
          >
            <CardContent className="pt-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="font-semibold mb-1 text-[color:var(--text-color)]">
                    Delivery from {delivery.hotel}
                  </div>
                  <div className="text-sm text-[color:var(--muted-text)] mb-2">
                    {new Date(delivery.date).toLocaleDateString()} • Delivered by {delivery.robin}
                  </div>
                  <div className="space-y-1">
                    {delivery.items.map((item, index) => (
                      <div key={index} className="text-sm text-[color:var(--muted-text)]">
                        • {item}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="text-right">
                  <div className="flex items-center space-x-1 mb-2">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < delivery.rating
                            ? "text-[color:var(--accent-pink-dark)] fill-current"
                            : "text-[color:var(--muted-text)]"
                        }`}
                      />
                    ))}
                  </div>
                  <Badge
                    variant="outline"
                    className="border-[color:var(--green-light)] text-[color:var(--green-primary)]"
                  >
                    Delivered
                  </Badge>
                </div>
              </div>

              {delivery.feedback && (
                <div className="p-3 bg-[color:var(--bg-color-light)] rounded-lg border border-[color:var(--green-light)]/10">
                  <div className="text-sm font-medium mb-1 text-[color:var(--text-color)]">
                    Your Feedback:
                  </div>
                  <div className="text-sm text-[color:var(--muted-text)]">
                    "{delivery.feedback}"
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Feedback Form */}
      <Card className="bg-[color:var(--card-bg)] border border-[color:var(--green-light)]/20 shadow-sm">
        <CardHeader>
          <CardTitle className="text-[color:var(--text-color)]">
            Rate Your Last Delivery
          </CardTitle>
          <CardDescription className="text-[color:var(--muted-text)]">
            Help us improve our service
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {["Food Quality", "Freshness", "Quantity"].map((label) => (
            <div key={label}>
              <label className="text-sm font-medium mb-2 block text-[color:var(--text-color)]">
                {label}
              </label>
              <div className="flex space-x-1">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <button
                    key={rating}
                    className="p-1 transition-transform hover:scale-110"
                  >
                    <Star className="w-6 h-6 text-[color:var(--muted-text)] hover:text-[color:var(--accent-pink-dark)]" />
                  </button>
                ))}
              </div>
            </div>
          ))}

          <div>
            <label className="text-sm font-medium mb-2 block text-[color:var(--text-color)]">
              Additional Comments
            </label>
            <Textarea
              placeholder="Share your experience..."
              className="min-h-20 border-[color:var(--green-light)]/30 focus-visible:ring-[color:var(--green-light)]"
            />
          </div>

          <div className="flex space-x-2">
            <Button
              variant="outline"
              className="flex-1 border-[color:var(--green-light)] text-[color:var(--green-primary)] hover:bg-[color:var(--green-light)]/10"
            >
              <Camera className="w-4 h-4 mr-2" />
              Add Photo
            </Button>
            <Button
              className="flex-1 bg-[color:var(--green-primary)] hover:bg-[color:var(--green-dark)] text-white"
            >
              Submit Review
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
