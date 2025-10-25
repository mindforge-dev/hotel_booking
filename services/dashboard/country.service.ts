import { CountryFormData } from "@/schemas/ country.schema"
import axios from "axios"
export async function createCountry(data: CountryFormData) {
    const formData = new FormData()
    formData.append("countryName", data.countryName)
    formData.append("countryCode", data.countryCode.toUpperCase())
    formData.append("countryImage", data.countryImage[0])

    console.log("FormData entries:")
    for (const pair of formData.entries()) {
        console.log(`${pair[0]}: ${pair[1]}`)
    }

    try {
        const response = await axios.post('/api/dashboard/countries/create', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        })
        return response.data
    } catch (error) {
        return Promise.reject(error)
    }

}
