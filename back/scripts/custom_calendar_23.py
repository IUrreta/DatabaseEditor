import sqlite3
import random



def run_script(option=""):
    conn = sqlite3.connect("../result/main.db")
    cursor = conn.cursor()
    
    default_tracks = [2, 1, 11, 24, 22, 5, 6, 4, 7, 10, 9, 12, 13, 14, 15, 17, 19, 18, 20, 21, 23, 25, 26]
    track_ids = []

    calendar = option.lower()
    races = calendar.split()

    for race in races:
        format = race[-1]
        race_code = race[:-1]
        print(race_code, format)
        if race_code in races_map:
            track_ids.append(race_code)
            formats.append(format)

    print(track_ids)
    print(formats)

 

    
    # Getting all the current season races
    day_season = cursor.execute("SELECT Day, CurrentSeason FROM Player_State").fetchone()
    season_events = cursor.execute("SELECT RaceID FROM Races WHERE SeasonID = " + str(day_season[1])).fetchall()

    season_first_event = season_events[0][0]
    season_last_event = season_events[-1][0]
    curr_event = season_last_event + 1

    #Inserting new race calendar
    for i in range (len(track_ids)):
        data_race = cursor.execute("SELECT * FROM Races WHERE TrackID = "+ str(track_ids[i]) + " AND SeasonID = " + str(day_season[1])).fetchone()
        if(str(data_race[3]) == "4" or str(data_race[3]) == "9" or str(data_race[3]) == "13" or str(data_race[3]) == "26" or str(data_race[3]) == "19" or str(data_race[3]) == "20" or str(data_race[3]) == "6"):
            type = "1"
        elif(str(data_race[3]) == "24" or str(data_race[3]) == "12"):
            type = "2"
        else:
            type = "0"
        cursor.execute("INSERT INTO Races VALUES (" + str(curr_event) + ", " + str(data_race[1]) + ", " + str(data_race[2]) + ", " + str(data_race[3]) + ", " + str(data_race[4]) + ", " + str(data_race[5]) + ", " + str(data_race[6]) + ", " + str(data_race[7]) + ", " + str(data_race[8]) + ", " + str(data_race[9]) + ", " + str(data_race[10]) + ", " + str(data_race[11]) + ", " + str(data_race[12]) + ", " + str(data_race[13]) + ", " + type + ")")
        curr_event += 1  


    curr_event = season_last_event + 1
    race_blanks = 22 - len(track_ids)
    random_blanks = []
    race_cont = 0

    #Random race days that will no longer host a GP
    for i in range (0, race_blanks):
        n = random.randint(0,21)
        while(n in random_blanks):
            n = random.randint(0,21)
        random_blanks.append(n)


    # Updating race days to spread them
    for i in range(len(default_tracks)):
        if (race_cont not in random_blanks):
            new_date = cursor.execute("SELECT Day FROM Races WHERE RaceID = " + str(season_first_event)).fetchone()[0]
            cursor.execute("UPDATE Races SET Day = " + str(new_date) + " WHERE RaceID = " + str(curr_event))
            curr_event += 1    
        season_first_event += 1
        race_cont += 1
        
    #Deletion of previous race calendar
    cursor.execute("DELETE FROM Races WHERE SeasonID = " + str(day_season[1]) + " AND RaceID <= " + str(season_last_event))


    conn.commit()
    conn.close()


def get_description():
    return "Creates a custom calendar. Available options are: bah, sau, aus, imo, mia, bar, mon, bak, can, gbr, aut, fra, hun, bel, ned, ita, sin, jap, usa, mex, bra, uae.\nAuthor: u/ignaciourreta"

if __name__ == '__main__':
    run_script()