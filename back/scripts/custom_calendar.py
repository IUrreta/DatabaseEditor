import sqlite3
import random



def run_script(option=""):
    conn = sqlite3.connect("../result/main.db")
    cursor = conn.cursor()

    weather_dict = {"0": 1, "1":2, "2":4, "3":8, "4":16, "5":32}
    calendar = option.lower()
    races = calendar.split()
    year_iteration = races[-1]
    races = races[:-1]
    if year_iteration == "24":
        max_races = 24
        weeks = [11,8,15,36,24,20,22,25,26,9,28,29,34,37,13,42,41,43,48,17,33,19,46,47]
    elif year_iteration == "23":
        max_races = 23
        weeks = [12,8,16,21,20,23,25,26,10,28,29,34,36,37,42,41,43,46,17,33,19,45,39]

    race_blanks = max_races - len(races)
    
    day_season = cursor.execute("SELECT Day, CurrentSeason FROM Player_State").fetchone()
    actual_calendar = cursor.execute(f"SELECT TrackID FROM Races WHERE SeasonID = {day_season[1]}").fetchall()
    actual_calendar = [race[0] for race in actual_calendar]
    new_calendar = [int(gp[:-5]) for gp in races]
    if actual_calendar == new_calendar:
        #for only editing weekend formats and rain
        ids = cursor.execute(f"SELECT RaceID FROM Races WHERE SeasonID = {day_season[1]}").fetchall()
        ids = [race[0] for race in ids]
        for i, race in enumerate(races):
            state = race[-1]
            format = race[-2]
            rainR = weather_dict[race[-3]]
            rainRBool = 1 if float(rainR) >= 8 else 0
            rainQ = weather_dict[race[-4]]
            rainQBool = 1 if float(rainQ)  >= 8 else 0
            rainP = weather_dict[race[-5]]
            rainPBool = 1 if float(rainP) >= 8 else 0
            race_code = race[:-5]
            cursor.execute(f"UPDATE RACES SET RainQualifying = {rainQBool}, WeatherStateQualifying = {rainQ}, RainRace = {rainRBool}, WeatherStateRace = {rainR}, WeekendType = {format} WHERE RaceID = {ids[i]}")
    else:
        #for editing race number + other things
        random_blanks = []
        for i in range (0, race_blanks):
            n = random.randint(0,max_races-1)
            while(n in random_blanks):
                n = random.randint(0,max_races-1)
            random_blanks.append(n)


        for el in random_blanks:
            weeks[el] = 0

        weeks = [i for i in weeks if i != 0] 
        
        weeks.sort()
        leap_year_count = 2
        
        year_diff = day_season[1] - 2023
        leap_year_count += year_diff
        day_start = 44927  + (year_diff*365) + (leap_year_count//4)
        day_of_week = day_start % 7
        days_until_sunday = (8 - day_of_week) % 7
        day_start = day_start + days_until_sunday
        last_race_last_season = cursor.execute(f"SELECT MAX(RaceID) FROM Races WHERE SeasonID = {day_season[1] - 1}").fetchone()
        last_id = last_race_last_season[0]
        first_race_this_season = cursor.execute(f"SELECT MIN(RaceID) FROM Races WHERE SeasonID = {day_season[1]}").fetchone()
        first_id = first_race_this_season[0]
        rain_tuple = (8, 16, 32)
        non_rain_tuple = (1,2,4)
        if int(last_id) == (int(first_id) - 1):
            #for good calendars (first race of the season isa raceID + 1 from the last race of the previous season)
            raceid = last_id
        else:
            #for bad calendars
            raceid = first_id - 1

        #Deletion of previous race calendar
        cursor.execute(f"DELETE FROM Races WHERE State != 2 AND SeasonID = {day_season[1]}")

        for i, race in enumerate(races):
            state = race[-1]
            format = race[-2]
            rainR = weather_dict[race[-3]]
            rainRBool = 1 if float(rainR) >= 8 else 0
            rainQ = weather_dict[race[-4]]
            rainQBool = 1 if float(rainQ)  >= 8 else 0
            rainP = weather_dict[race[-5]]
            rainPBool = 1 if float(rainP) >= 8 else 0
            race_code = race[:-5]
            temps = cursor.execute(f"SELECT TemperatureMin, TemperatureMax FROM Races_Templates WHERE TrackID = {race_code}").fetchone()
            tempP = random.randint(int(temps[0]), int(temps[1]))
            tempQ = random.randint(int(temps[0]), int(temps[1]))
            tempR = random.randint(int(temps[0]), int(temps[1]))
            day = ((weeks[i]+1)*7) + day_start
            raceid += 1
            if state != "2":
                cursor.execute(f"INSERT INTO Races VALUES ({raceid}, {day_season[1]}, {day}, {race_code}, {state}, {rainPBool}, {tempP}, {rainP}, {rainQBool}, {tempQ}, {rainQ}, {rainRBool}, {tempR}, {rainR}, {format})")


    conn.commit()
    conn.close()


if __name__ == '__main__':
    run_script()