"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"

export default function RegisterPage() {
  const router = useRouter()
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.get("name"),
          email: formData.get("email"),
          password: formData.get("password"),
        }),
      })

      if (!res.ok) {
        throw new Error(await res.text())
      }

      router.push("/login")
    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto max-w-md py-20">
      <h1 className="text-3xl font-bold mb-6">Create an Account</h1>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Input
            type="text"
            name="name"
            placeholder="Name"
            required
          />
        </div>
        <div>
          <Input
            type="email"
            name="email"
            placeholder="Email"
            required
          />
        </div>
        <div>
          <Input
            type="password"
            name="password"
            placeholder="Password"
            required
          />
        </div>
        
        {error && (
          <p className="text-red-500 text-sm">{error}</p>
        )}

        <Button
          type="submit"
          className="w-full"
          disabled={loading}
        >
          {loading ? "Creating account..." : "Register"}
        </Button>
      </form>

      <p className="mt-4 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/login" className="text-primary hover:underline">
          Login
        </Link>
      </p>
    </div>
  )
}