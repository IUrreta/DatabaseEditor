import sqlite3
import random



def run_script(option=""):
    conn = sqlite3.connect("../result/main.db")
    cursor = conn.cursor()
    
    default_tracks = [2, 1, 11, 24, 22, 5, 6, 4, 7, 10, 9, 12, 13, 14, 15, 17, 19, 18, 20, 21, 23, 25, 26]
    races_map = {"bah": 2,"aus": 1,"sau": 11,"imo": 24,"mia": 22,"spa": 5, "mon": 6,"aze": 4,"can": 7,"gbr": 10,"aut": 9,"fra": 8,"hun": 12,"bel": 13,"ita": 14,"sgp": 15,"jap": 17,"usa": 19,"mex": 18,"bra": 20,"uae": 21,"ned": 23,"veg": 25,"qat": 26}
    races_codes = ["bah", "aus", "sau", "imo", "mia", "spa", "mon", "aze", "can", "gbr", "aut", "fra", "hun", "bel", "ita", "sgp", "jap", "usa", "mex", "bra", "uae", "ned", "veg", "qat"]

    track_ids = []
    formats = []

    calendar = option.lower()
    races = calendar.split()

    for race in races:
        format = race[-1]
        race_code = race[:-1]
        print(race_code, format)
        if race_code in races_map:
            track_ids.append(races_map[race])
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
        cursor.execute("INSERT INTO Races VALUES (" + str(curr_event) + ", " + str(data_race[1]) + ", " + str(data_race[2]) + ", " + str(data_race[3]) + ", " + str(data_race[4]) + ", " + str(data_race[5]) + ", " + str(data_race[6]) + ", " + str(data_race[7]) + ", " + str(data_race[8]) + ", " + str(data_race[9]) + ", " + str(data_race[10]) + ", " + str(data_race[11]) + ", " + str(data_race[12]) + ", " + str(data_race[13]) + ", " + formats[i] + ")")
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