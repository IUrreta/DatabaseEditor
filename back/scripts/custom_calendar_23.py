import sqlite3
import random



def run_script(option=""):
    conn = sqlite3.connect("../result/main.db")
    cursor = conn.cursor()
    
    default_tracks = [2, 1, 11, 24, 22, 5, 6, 4, 7, 10, 9, 12, 13, 14, 15, 17, 19, 18, 20, 21, 23, 25, 26]
    track_ids = []

    calendar = option.lower()
    races = calendar.split()

    for i in range(len(races)):
        if (races[i]) == "bah":
            track_ids.insert(i, 2)
        elif (races[i]) == "aus":
            track_ids.insert(i, 1)
        elif (races[i]) == "sau":
            track_ids.insert(i, 11)
        elif (races[i]) == "imo":
            track_ids.insert(i, 24)
        elif (races[i]) == "mia":
            track_ids.insert(i, 22)
        elif (races[i]) == "bar":
            track_ids.insert(i, 5)
        elif (races[i]) == "mon":
            track_ids.insert(i, 6)
        elif (races[i]) == "aze":
            track_ids.insert(i, 4)
        elif (races[i]) == "can":
            track_ids.insert(i, 7)
        elif (races[i]) == "gbr":
            track_ids.insert(i, 10)
        elif (races[i]) == "aut":
            track_ids.insert(i, 9)
        elif (races[i]) == "fra":
            track_ids.insert(i, 8) 
        elif (races[i]) == "hun":
            track_ids.insert(i, 12)
        elif (races[i]) == "bel":
            track_ids.insert(i, 13)
        elif (races[i]) == "ita":
            track_ids.insert(i, 14)
        elif (races[i]) == "sgp":
            track_ids.insert(i, 15)
        elif (races[i]) == "jap":
            track_ids.insert(i, 17)
        elif (races[i]) == "usa":
            track_ids.insert(i, 19)
        elif (races[i]) == "mex":
            track_ids.insert(i, 18)
        elif (races[i]) == "bra":
            track_ids.insert(i, 20)
        elif (races[i]) == "uae":
            track_ids.insert(i, 21)  
        elif (races[i]) == "ned":
            track_ids.insert(i, 23)
        elif (races[i]) == "veg":
            track_ids.insert(i, 25)  
        elif (races[i]) == "qat":
            track_ids.insert(i, 26)    
    
    # Getting all the current season races
    day_season = cursor.execute("SELECT Day, CurrentSeason FROM Player_State").fetchone()
    season_events = cursor.execute("SELECT RaceID FROM Races WHERE SeasonID = " + str(day_season[1])).fetchall()

    season_first_event = season_events[0][0]
    season_last_event = season_events[-1][0]
    curr_event = season_last_event + 1

    #Inserting new race calendar
    for i in range (len(track_ids)):
        data_race = cursor.execute("SELECT * FROM Races WHERE TrackID = "+ str(track_ids[i]) + " AND SeasonID = " + str(day_season[1])).fetchone()
        cursor.execute("INSERT INTO Races VALUES (" + str(curr_event) + ", " + str(data_race[1]) + ", " + str(data_race[2]) + ", " + str(data_race[3]) + ", " + str(data_race[4]) + ", " + str(data_race[5]) + ", " + str(data_race[6]) + ", " + str(data_race[7]) + ", " + str(data_race[8]) + ", " + str(data_race[9]) + ", " + str(data_race[10]) + ", " + str(data_race[11]) + ", " + str(data_race[12]) + ", " + str(data_race[13]) + ", 0)")
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