from flask import Flask, render_template, request, jsonify
import requests
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)

API_KEY = os.getenv("OPENWEATHER_API_KEY")

CURRENT_URL = "https://api.openweathermap.org/data/2.5/weather"
FORECAST_URL = "https://api.openweathermap.org/data/2.5/forecast"


@app.route("/")
def home():
    return render_template("index.html")


def get_location_params(city=None, lat=None, lon=None):

    if lat and lon:
        return {
            "lat": lat,
            "lon": lon,
            "appid": API_KEY,
            "units": "metric"
        }

    return {
        "q": city,
        "appid": API_KEY,
        "units": "metric"
    }


@app.route("/weather")
def weather():

    city = request.args.get("city")
    lat = request.args.get("lat")
    lon = request.args.get("lon")

    if not city and not (lat and lon):
        return jsonify({
            "error": "Please enter a city or allow location access."
        }), 400

    try:

        params = get_location_params(city, lat, lon)

        response = requests.get(
            CURRENT_URL,
            params=params,
            timeout=10
        )

        print("Weather API Status:", response.status_code)

        if response.status_code != 200:
            return jsonify({
                "error": "Unable to find weather information."
            }), response.status_code

        data = response.json()

        weather_data = {
            "city": data["name"],
            "country": data["sys"]["country"],
            "temperature": data["main"]["temp"],
            "feels_like": data["main"]["feels_like"],
            "humidity": data["main"]["humidity"],
            "pressure": data["main"]["pressure"],
            "wind_speed": data["wind"]["speed"],
            "description": data["weather"][0]["description"],
            "icon": data["weather"][0]["icon"],
            "weather_id": data["weather"][0]["id"],
            "sunrise": data["sys"]["sunrise"],
            "sunset": data["sys"]["sunset"],
            "timezone": data["timezone"]
        }

        return jsonify(weather_data)

    except requests.exceptions.RequestException as e:

        print("Weather Request Error:", e)

        return jsonify({
            "error": "Unable to connect to weather service."
        }), 500

    except Exception as e:

        print("Weather Application Error:", e)

        return jsonify({
            "error": "An unexpected error occurred."
        }), 500


@app.route("/forecast")
def forecast():

    city = request.args.get("city")
    lat = request.args.get("lat")
    lon = request.args.get("lon")

    if not city and not (lat and lon):
        return jsonify({
            "error": "Location is required."
        }), 400

    try:

        params = get_location_params(city, lat, lon)

        response = requests.get(
            FORECAST_URL,
            params=params,
            timeout=10
        )

        print("Forecast API Status:", response.status_code)

        if response.status_code != 200:
            return jsonify({
                "error": "Unable to get forecast."
            }), response.status_code

        data = response.json()

        forecast_list = []

        for item in data["list"]:

            forecast_list.append({

                "date": item["dt_txt"],

                "temperature": item["main"]["temp"],

                "feels_like": item["main"]["feels_like"],

                "humidity": item["main"]["humidity"],

                "description":
                    item["weather"][0]["description"],

                "icon":
                    item["weather"][0]["icon"],

                "weather_id":
                    item["weather"][0]["id"]

            })

        return jsonify({
            "city": data["city"]["name"],
            "country": data["city"]["country"],
            "forecast": forecast_list
        })

    except requests.exceptions.RequestException as e:

        print("Forecast Request Error:", e)

        return jsonify({
            "error": "Unable to connect to forecast service."
        }), 500

    except Exception as e:

        print("Forecast Application Error:", e)

        return jsonify({
            "error": "An unexpected error occurred."
        }), 500


if __name__ == "__main__":
    app.run(debug=True)