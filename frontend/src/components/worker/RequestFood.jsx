"use client"

import { useState } from "react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import {
  Heart,
  MapPin,
  Phone,
  MessageCircle,
  Users,
  CheckCircle,
} from "lucide-react"

export default function RequestFood() {
  const workerProfile = {
    name: "Ravi Kumar",
    location: "Sector 7, Andheri West, Mumbai",
  }

  const preferences = [
    { id: "veg", label: "Vegetarian" },
    { id: "nonveg", label: "Non-Vegetarian" },
    { id: "spicy", label: "Spicy" },
    { id: "lessoil", label: "Less Oil" },
  ]

  const [selectedPreferences, setSelectedPreferences] = useState([])
  const [specialRequests, setSpecialRequests] = useState("")
  const [hasActiveRequest, setHasActiveRequest] = useState(false)

  const handlePreferenceChange = (id, checked) => {
    setSelectedPreferences((prev) =>
      checked ? [...prev, id] : prev.filter((item) => item !== id)
    )
  }

  const handleRequestFood = () => {
    console.log("Food request submitted:", {
      selectedPreferences,
      specialRequests,
      location: workerProfile.location,
    })
    setHasActiveRequest(true)
  }

  return (
    <div className="space-y-6">
      {!hasActiveRequest ? (
        <>
          {/* Request Form */}
          <Card className="bg-[var(--card-bg)] border border-[var(--green-light)]/20">
            <CardHeader>
              <CardTitle className="flex items-center text-[var(--green-primary)]">
                <Heart className="w-5 h-5 mr-2 text-[var(--accent-pink-dark)]" />
                Need Food Tonight?
              </CardTitle>
              <CardDescription className="text-[var(--muted-text)]">
                Let us know your preferences and we'll find available food for you.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Food Preferences */}
              <div>
                <h4 className="font-semibold text-[var(--text-color)] mb-3">
                  Food Preferences
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {preferences.map((preference) => (
                    <div key={preference.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={preference.id}
                        checked={selectedPreferences.includes(preference.id)}
                        onCheckedChange={(checked) =>
                          handlePreferenceChange(preference.id, checked)
                        }
                      />
                      <label htmlFor={preference.id} className="text-sm text-[var(--text-color)]">
                        {preference.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Special Requests */}
              <div>
                <h4 className="font-semibold text-[var(--text-color)] mb-3">
                  Special Requests or Allergies
                </h4>
                <Textarea
                  placeholder="Any specific dietary requirements, allergies, or special requests..."
                  value={specialRequests}
                  onChange={(e) => setSpecialRequests(e.target.value)}
                  className="min-h-20 bg-[var(--bg-color-light)] border border-[var(--green-light)]/30"
                />
              </div>

              {/* Delivery Location */}
              <div>
                <h4 className="font-semibold text-[var(--text-color)] mb-3">Delivery Location</h4>
                <div className="flex items-center space-x-2 p-3 bg-[var(--bg-color-light)] rounded-lg border border-[var(--green-light)]/30">
                  <MapPin className="w-4 h-4 text-[var(--green-primary)]" />
                  <span className="text-sm text-[var(--text-color)]">
                    {workerProfile.location}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    className="ml-auto text-[var(--green-primary)] border-[var(--green-light)] bg-transparent hover:bg-[var(--green-light)]/10"
                  >
                    Update
                  </Button>
                </div>
              </div>

              <Button
                onClick={handleRequestFood}
                className="w-full bg-[var(--green-primary)] hover:bg-[var(--green-dark)] text-white font-medium text-base py-5"
              >
                <Heart className="w-4 h-4 mr-2 text-[var(--accent-pink)]" />
                Request Food for Tonight
              </Button>
            </CardContent>
          </Card>

          {/* Community Support */}
          <Card className="bg-[var(--card-bg)] border border-[var(--green-light)]/20">
            <CardHeader>
              <CardTitle className="text-[var(--green-primary)]">Community Support</CardTitle>
              <CardDescription className="text-[var(--muted-text)]">
                Resources and assistance available to you
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button
                  variant="outline"
                  className="justify-start border-[var(--green-light)] text-[var(--green-primary)] hover:bg-[var(--green-light)]/10 bg-transparent"
                >
                  <Phone className="w-4 h-4 mr-2 text-[var(--green-primary)]" />
                  Emergency Hotline
                </Button>
                <Button
                  variant="outline"
                  className="justify-start border-[var(--green-light)] text-[var(--green-primary)] hover:bg-[var(--green-light)]/10 bg-transparent"
                >
                  <MessageCircle className="w-4 h-4 mr-2 text-[var(--green-primary)]" />
                  Community Chat
                </Button>
                <Button
                  variant="outline"
                  className="justify-start border-[var(--green-light)] text-[var(--green-primary)] hover:bg-[var(--green-light)]/10 bg-transparent"
                >
                  <MapPin className="w-4 h-4 mr-2 text-[var(--green-primary)]" />
                  Nearby Resources
                </Button>
                <Button
                  variant="outline"
                  className="justify-start border-[var(--green-light)] text-[var(--green-primary)] hover:bg-[var(--green-light)]/10 bg-transparent"
                >
                  <Users className="w-4 h-4 mr-2 text-[var(--green-primary)]" />
                  Support Groups
                </Button>
              </div>
            </CardContent>
          </Card>
        </>
      ) : (
        <Card className="bg-[var(--card-bg)] border border-[var(--green-light)]/30 text-center py-12">
          <CardContent>
            <CheckCircle className="w-12 h-12 text-[var(--green-light)] mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2 text-[var(--text-color)]">
              Request Submitted
            </h3>
            <p className="text-[var(--muted-text)] mb-4">
              Your food request has been submitted and we're finding available food for you.
            </p>
            <Button
              onClick={() => setHasActiveRequest(false)}
              className="bg-[var(--green-primary)] hover:bg-[var(--green-dark)] text-white"
            >
              Make Another Request
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
