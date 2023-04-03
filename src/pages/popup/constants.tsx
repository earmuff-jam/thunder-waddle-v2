import { useEffect, useState } from "react";
export const inspirationBaseUrl = 'https://api.goprogram.ai/inspiration';
export const publicHolidayBaseUrl = 'https://date.nager.at/api/v3/PublicHolidays/';
export const defaultTimeZone = 'MST7MDT'; // mountain zone
export const defaultCountrySelection = 'US';
export const weatherUrl = 'https://api.open-meteo.com/v1/forecast?';
export const wikiSearchUrl = 'https://en.wikipedia.org/w/api.php?format=json&action=query&prop=extracts&exintro=&explaintext=&titles=';
export const blankQuotes = {
    title: 'Inspirational Quotes',
    author: '',
    quote: '',
    fewWords: '',
};
export const blankHoliday = {
    date: '',
    localName: '',
    name: '',
};
export const blankWeather = {
    current_temp: '',
    sunrise: '',
    sunset: '',
    rain_sum: 0,
    current_rain: 0,
    current_day_sunrise: '',
    current_day_sunset: '',
};
export const queryParams = [
    'latitude',
    'longitude',
    'current_weather',
    'temperature_unit',
    'daily',
    'daily',
    'daily',
    'timezone',
];
export const usePopupBuilder = () => {
    const [loading, setLoading] = useState(true);
    const [pageDetails, setPageDetails] = useState({ ...blankQuotes });
    const [holiday, setHoliday] = useState({ ...blankHoliday });
    const [currentWeather, setCurrentWeather] = useState({ ...blankWeather });
    const showPosition = async (position) => {
        const { coords } = position;
        const { latitude, longitude } = coords;
        const paramOptions = [latitude, longitude, 'true', 'fahrenheit', 'sunrise', 'sunset', 'rain_sum', defaultTimeZone];
        const queryStr = queryParams.reduce((acc, el, index) => {
            acc += el + "=" + paramOptions[index] + '&';
            return acc;
        }, '');
        const completeUrl = weatherUrl + queryStr;
        const response = await fetch(completeUrl, {
            method: 'GET',
            mode: 'cors',
            cache: 'no-cache',
            headers: {
            },
            redirect: "follow"
        }).then(response => response.json());
        const copyWeather = { ...blankWeather };
        const current_weather = response?.current_weather;
        const { sunrise, sunset, rain_sum } = response?.daily;
        copyWeather.current_temp = current_weather.temperature;
        copyWeather.current_rain = rain_sum[0];
        copyWeather.current_day_sunrise = sunrise[0].split('T')[1];
        copyWeather.current_day_sunset = sunset[0].split('T')[1];
        setCurrentWeather({ ...copyWeather });
    };
    const fetchWeather = () => {
        navigator.geolocation.getCurrentPosition(showPosition);
    }
    const fetchQuotesV2 = async () => {
        const url = inspirationBaseUrl;
        const response = await fetch(url, {
            method: 'GET',
            mode: 'cors',
            cache: 'no-cache',
            headers: {
            },
            redirect: "follow"
        });
        return response;
    };
    const fetchHolidaysV2 = () => {
        const baseUrl = publicHolidayBaseUrl;
        const date = new Date();
        const currentYear = date.getFullYear();
        const completeUrl = baseUrl + currentYear + '/' + defaultCountrySelection;
        const response = fetch(completeUrl, {
            method: 'GET',
            mode: 'cors',
            cache: 'no-cache',
            redirect: 'follow'
        });
        return response;
    }
    const fetchWikiDetails = async (author) => {
        if (author !== 'Anonymous') {
            const baseUrl = wikiSearchUrl;
            const firstName = author.split(" ")[0];
            const lastName = author.split(" ")[1];
            const searchParams = [firstName, lastName].reduce((acc, el) => {
                acc += el + '_';
                return acc;
            }, '');
            const completeUrl = baseUrl + searchParams;
            const response = await fetch(completeUrl, {
                method: 'GET',
                mode: 'cors',
                cache: 'no-cache',
                headers: {
                },
                redirect: "follow"
            }).then(response => response.json())
            const extractDetails: any = Object.values(response?.query.pages)[0];
            const extract = extractDetails?.extract;
            const fewWords = extract.split(" (")[1].split(")")[0];
            const newPageDetails = { ...pageDetails };
            newPageDetails.fewWords = fewWords ?? 'No public info';
            setPageDetails({ ...newPageDetails });
        } else {
            const newPageDetails = { ...pageDetails };
            newPageDetails.fewWords = "No public info";
            setPageDetails({ ...newPageDetails });
        }
    };
    const fetchRequiredApis = () => {
        Promise.all([fetchHolidaysV2, fetchQuotesV2])
            .then(([res1, res2]) => {
                return Promise.all([res1(), res2()])
            })
            .then(([response1, response2]) => {
                return Promise.all([response1.json(), response2.json()])
            }).then(([response1Json, response2Json]) => {
                const date = new Date();
                const formattedDate = date.toISOString().split('T')[0];
                const selectedDate = response1Json?.reduce((acc, el) => {
                    if (formattedDate === el.date) {
                        acc['date'] = el.date;
                        acc['localName'] = el.localName;
                        acc['name'] = el.name;
                    }
                    return acc;
                }, {});
                const copyHoliday = { ...holiday };
                if (Object.values(selectedDate).length < 1) {
                    copyHoliday.date = formattedDate;
                    copyHoliday.localName = 'No public holiday today';
                    copyHoliday.name = 'No public holiday today'
                };
                setHoliday({ ...copyHoliday });
                const copyQuote = { ...pageDetails };
                copyQuote['author'] = response2Json?.author;
                copyQuote['quote'] = response2Json?.quote;
                setPageDetails({ ...copyQuote });
            }).finally(() => setLoading(false));
    }
    useEffect(() => {
        fetchRequiredApis();
        fetchWeather();
    }, []);

    useEffect(() => {
        fetchWikiDetails(pageDetails?.author);
    }, [pageDetails.author]);

    return {
        loading,
        pageDetails,
        holiday,
        currentWeather,
    };
}