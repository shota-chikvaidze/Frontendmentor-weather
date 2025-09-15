import React, { useState, useEffect } from 'react'
import axios from 'axios'
import './Home.css'
import WebsiteLogo from '../assets/images/logo.svg'
import Settings from '../assets/images/icon-units.svg'
import Dropdown from '../assets/images/icon-dropdown.svg'
import Search from '../assets/images/icon-search.svg'
import bgToday from '../assets/images/bg-today-large.svg'
import errorIcon from '../assets/images/icon-error.svg'
import retryIcon from '../assets/images/icon-retry.svg'
import loadingIcon from '../assets/images/icon-loading.svg'

import drizzleIcon from '../assets/images/icon-drizzle.webp'
import sunnyIcon from '../assets/images/icon-sunny.webp'
import fogIcon from '../assets/images/icon-fog.webp'
import overcastIcon from '../assets/images/icon-overcast.webp'
import partlyCloudyIcon from '../assets/images/icon-partly-cloudy.webp'
import rainIcon from '../assets/images/icon-rain.webp'
import snowIcon from '../assets/images/icon-snow.webp'
import stormIcon from '../assets/images/icon-storm.webp'


export const Home = () => {

    const [weather, setWeather] = useState({})
    const [search, setSearch] = useState('')
    const [error, setError] = useState(null)
    const [apiError, setApiError] = useState(null)
    const [loading, setLoading] = useState(false)
    const [searchLoading, setSearchLoading] = useState(false)
    const [selectedDay, setSelectedDay] = useState(null)

    const weatherIcons = {
        0: sunnyIcon,
        1: sunnyIcon,
        2: partlyCloudyIcon,
        3: overcastIcon,                
        45: fogIcon,
        48: fogIcon,
        51: drizzleIcon,
        53: drizzleIcon,
        55: drizzleIcon,
        56: drizzleIcon,
        57: drizzleIcon,
        61: rainIcon,
        63: rainIcon,
        65: rainIcon,
        66: rainIcon,
        67: rainIcon,
        71: snowIcon,
        73: snowIcon,
        75: snowIcon,
        77: snowIcon,
        80: rainIcon,
        81: rainIcon,
        82: rainIcon,
        85: snowIcon,
        86: snowIcon,
        95: stormIcon,
        96: stormIcon,
        99: stormIcon
    }

    

    const fetchData = async () => {
        try{

            setSearchLoading(true)
            const res = await axios.get(`https://geocoding-api.open-meteo.com/v1/search?name=${search}&count=10&language=en&format=json`)

            if (!res.data.results || res.data.results.length === 0) {
                setError('No search results found!')
                setLoading(false)
                return
            }
            setSearchLoading(false)
            setLoading(true)



            const { latitude, longitude, timezone, name, country } = res.data.results[0]

            const weatherRes = await axios.get(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&hourly=temperature_2m,precipitation,relative_humidity_2m,weathercode&daily=temperature_2m_max,temperature_2m_min,weathercode&current_weather=true&timezone=${timezone}`)

            const currentTime = weatherRes.data.current_weather.time
            const date = new Date(currentTime)
            const formattedDate = date.toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'short',
                day: 'numeric',
                year: 'numeric'
            })

            const hourIndex = weatherRes.data.hourly.time.findIndex(t => {
                return new Date(t).getTime() === new Date(currentTime).getTime()
            })
            const safeHourIndex = hourIndex >= 0 ? hourIndex : 0
            const currentHumidity = weatherRes.data.hourly.relative_humidity_2m[safeHourIndex]
            const currentprecipitation = weatherRes.data.hourly.precipitation[safeHourIndex]

            const hourlyGrouped = {}

            weatherRes.data.hourly.time.forEach((t, index) => {
                const day = t.split('T')[0]
                if (!hourlyGrouped[day]) hourlyGrouped[day] = []
                hourlyGrouped[day].push({
                    time: t,
                    temperature: weatherRes.data.hourly.temperature_2m[index],  
                    icon: weatherIcons[weatherRes.data.hourly.weathercode[index]] || sunnyIcon
                })
            })

            const dailyIcons = weatherRes.data.daily.weathercode.map(
                code => weatherIcons[code] || sunnyIcon
            )


            setWeather({
                location: `${name}, ${country}`,
                time: formattedDate,
                timezone,
                currentTemp: weatherRes.data.current_weather.temperature,
                feels: weatherRes.data.current_weather.temperature,
                windSpeed: weatherRes.data.current_weather.windspeed,
                precipitation: weatherRes.data.hourly_units.precipitation,
                currentHumidity,
                currentprecipitation,
                daily: weatherRes.data.daily,
                dailyIcons,
                hourly: hourlyGrouped,
            })

            setApiError(null)
            setError(null)
            setLoading(false)
            

        }catch(err){
            setApiError('hello')
            setLoading(false)
            setSearchLoading(false)
        }
    }

    useEffect(() => {
        if (weather.hourly) {
            setSelectedDay(Object.keys(weather.hourly)[0])
        }
        
    }, [weather])



  return (
    <>

    <section className='header'>
        <div className='header_wrapper'>
            <img src={WebsiteLogo} className='web_logo' alt='Website logo' />
            <div className='units'>
                <img src={Settings} />
                <p>Units</p>
                <img src={Dropdown} />
            </div>
        </div>
    </section>
    
    {apiError ? (
        <div className='api_error_item'>
            <img src={errorIcon} alt='Error icon' className='error_icon' />
            <h1>Something went wrong</h1>
            <p> We could't connect to the server (API error). Please try again in a few moments. </p>
            <button onClick={fetchData}>
                <img src={retryIcon} alt='Retry icon' />
                Retry
            </button>
        </div>
    ) : (
    <section className='home_sect'>
        <div className='home_sect_wrapper'>
            <div className='top'>
                <div className='top_text'>
                    <h1>How's the sky looking today?</h1>
                </div>
                <div className='top_search'>
                    <div className='search_side'>
                        <img src={Search} alt='search icon' />
                        <input 
                            type='search' 
                            onKeyDown={(e) => {
                                if(e.key === 'Enter') return fetchData() }} 
                            placeholder='Search for a place...' 
                            value={search} 
                            onChange={(e) => setSearch(e.target.value)} 
                        />
                        {searchLoading && (
                            error ? (
                                <></>
                            ) : (
                                <div className='search_loading'>
                                    <img src={loadingIcon} alt='Loading icon' />
                                    <p> Search in progress </p>
                                </div>
                            )
                        )}
                    </div>
                    <button onClick={fetchData}>
                        Search
                    </button>
                </div>
            </div>

            {error ? (
                <p className='no_search_res'> {error} </p>
            ) : (
            <div className='bottom'>
                <div className='search_results'>
                    <div className='search_results_top'>

                        <div className='city_name_wrapper'>
                            
                            {loading ? (
                                <div className='background_content_loading'>
                                    <p>Loading...</p>
                                </div>
                            ) : (
                                <>
                                    <img src={bgToday} alt='Background for Weather' className='city_name_wrapper_image' />
                                    <div className='background_content'>
                                        <div>
                                            <h2> {weather.location} </h2>
                                            <p> {weather.time} </p>
                                        </div>
                                        <div className='background_content_right_side'>
                                            <img src={weather.dailyIcons ? weather.dailyIcons[0] : sunnyIcon} alt='Weather icon' />
                                            <h1> {Math.floor(weather.currentTemp)}° </h1>
                                        </div>
                                    </div>
                                </>
                            )}

                        </div>

                        <div className='search_details'>
                            <div className='feels_like'>
                                <p>Feels like</p>
                                {loading ? <> — </> : <> {weather.feels} °C </>} 
                            </div>
                            
                            <div>
                                <p>Humidity</p>
                                {loading ? <> — </> : <> {weather.currentHumidity}% </>} 
                            </div>

                            <div>
                                <p>Wind</p>
                                {loading ? <> — </> : <> {weather.windSpeed}Km/h </>} 
                            </div>

                            <div>
                                <p>Precipitation</p>
                                {loading ? <> — </> : <> {weather.currentprecipitation}mm </>} 
                            </div>
                        </div>
                    </div>

                    <div className='search_results_bottom'>
                        <p className='search_results_bottom_text'>Daily forecast</p>
                        <div className='daily_forecast'>
                            {weather.daily?.time.map((day, index) => {
                                const date = new Date(day)
                                const formattedDate = date.toLocaleDateString('en-US', {
                                    weekday: "short"
                                })

                                return (
                                    
                                    loading ? (
                                        <div className='daily_item'></div>
                                    ) : (
                                    <div key={index} className='daily_item'>
                                        <p className='date_para'> {formattedDate} </p>
                                        <img src={weather.dailyIcons[index]} />

                                        <div className='daily_temps'>
                                            <p> {Math.floor(weather.daily.temperature_2m_max[index])}° </p>
                                            <p> {Math.floor(weather.daily.temperature_2m_min[index])}° </p>
                                        </div>
                                    </div>
                                    )
 
                                )
                            })}
                        </div>
                    </div>
                </div>

                <div className='hourly_forecast'>
                    <div>
                        <div className='select_days_wrapper'>
                            <p>Hourly forecast</p>
                            {loading ? (
                                <div className='hour_fore_loading'> — </div>
                            ) : (
                                <select key={selectedDay} onChange={(e) => setSelectedDay(e.target.value)}>
                                {Object.keys(weather.hourly || {}).map((day) => {
                                    const date = new Date(day)
                                    const label = date.toLocaleDateString("en-US", {
                                        weekday: "long",
                                    })
                                    return (
                                        <option key={day} value={day}>{label}</option>
                                    ) 
                                })}
                            </select>
                            )}
                            
                        </div>

                        <div className='hour_wrapper'>
                            {selectedDay && 
                                weather.hourly[selectedDay].map((hour, index) => {
                                    const date = new Date(hour.time)
                                    const formattedHour = date.toLocaleTimeString("en-US", {
                                        hour: "numeric",
                                        hour12: true
                                    })

                                    return (
                                        loading ? (
                                            <div className='hour_item'></div>
                                        ) : (
                                            <div key={index} className='hour_item'>
                                                <div className='hour_time_icon_wrapper'>
                                                    <p> {formattedHour} </p>
                                                    <img src={hour.icon} alt="Weather icon" />
                                                </div>
                                                <p> {Math.floor(hour.temperature)}°</p>
                                            </div>
                                        )
                                    )
                                })
                            }
                        </div>
                    </div>
                </div>
            </div>
            )}

        </div>
    </section>
    )}


    </>
  )
}
