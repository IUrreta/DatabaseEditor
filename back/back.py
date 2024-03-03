import asyncio
import websockets
import json
import sqlite3
import os
from datetime import datetime
import shutil
from scripts.extractor import process_unpack, process_repack
from scripts.transfer_driver_23 import run_script as run_trasnsfer
from scripts.transfer_driver_23 import unretire
from scripts.edit_stats_23 import run_script as run_editStats
from scripts.custom_calendar_23 import run_script as run_editCalendar
from scripts.car_performance_23 import run_script as run_editPerformance
from scripts.engine_performance_23 import run_script as run_editEngine
from scripts.head2head_23 import fetch_Head2Head, fetch_Head2Head_team
from scripts.edit_teams import fetch_teamData, edit_team
from scripts.predictor import predict, montecarlo
from utils import DatabaseUtils

team_dict = {"1": "Ferrari", "2": "McLaren", "3": "Red Bull", "4": "Mercedes", "5": "Alpine", "6": "Williams", "7": "Haas", "8": "Alfa Romeo", "9": "AlphaTauri", "10": "Aston Martin"}

class ApplicationState:
    def __init__(self, logFile):
        self.client = None
        self.path = None
        self.log = logFile
        self.dbutils = None

    async def handle_command(self, message):
        type = message["command"]
        argument = ""
        logtxt = str(message)
        if type == "connect":
            argument = type
            saves = [element for element in os.listdir("../") if ".sav" in element]
            if "player.sav" in saves:
                saves.remove("player.sav")
            saves.insert(0, "Connected Succesfully")
            data_saves = json.dumps(saves)
            await send_message_to_client(data_saves)
            await send_message_to_client(json.dumps(["JIC"]))

        elif type == "saveSelected":
            save = message["save"]
            argument = type + " " + save
            self.path = "../" + save
            process_unpack(self.path, "../result")
            conn = sqlite3.connect("../result/main.db")
            self.dbutils = DatabaseUtils(conn)
            drivers = self.dbutils.fetch_info()
            drivers.insert(0, "Save Loaded Succesfully")
            data_json_drivers = json.dumps(drivers)
            await send_message_to_client(data_json_drivers)
            staff = self.dbutils.fetch_staff()
            staff.insert(0, "Staff Fetched")
            data_json_staff = json.dumps(staff)
            await send_message_to_client(data_json_staff)
            engines = self.dbutils.fetch_engines()
            engines.insert(0, "Engines fetched")
            data_json_engines = json.dumps(engines)
            await send_message_to_client(data_json_engines)
            calendar = self.dbutils.fetch_calendar()
            calendar.insert(0, "Calendar fetched")
            data_json_calendar = json.dumps(calendar)
            await send_message_to_client(data_json_calendar)
            create_backup(self.path, save)
            year =  self.dbutils.fetch_year()
            year = ["Year fetched", year]
            data_json_year = json.dumps(year)
            await send_message_to_client(data_json_year)

        elif type =="hire":
            argument = "hire " + message["driverID"] + " " + str(message["teamID"]) + " " + message["position"] + " " + message["salary"] + " " + message["signBonus"] + " " + message["raceBonus"] + " " + message["raceBonusPos"] + " " + message["year"]
            run_trasnsfer(argument)
            process_repack("../result", self.path)
            info = []
            info.insert(0, "Succesfully moved " + message["driver"] + " into " + message["team"])
            info_json = json.dumps(info)
            await send_message_to_client(info_json)

        elif type =="fire":
            argument = "fire " + message["driverID"]
            run_trasnsfer(argument)
            process_repack("../result", self.path)
            info = []
            info.insert(0, "Succesfully released " + message["driver"] + " from " + message["team"])
            info_json = json.dumps(info)
            await send_message_to_client(info_json)

        elif type =="autocontract":
            argument = "hire " + message["driverID"] + " " +  str(message["teamID"]) + " " + message["position"]
            run_trasnsfer(argument)
            process_repack("../result", self.path)
            info = []
            info.insert(0, "Succesfully moved " + message["driver"] + " into " + message["team"])
            info_json = json.dumps(info)
            await send_message_to_client(info_json)

        elif type=="swap":
            argument = "swap " + message["driver1ID"] + " " + message["driver2ID"]
            run_trasnsfer(argument)
            process_repack("../result", self.path)
            info = []
            info.insert(0, "Succesfully swapped " + message["driver1"] + " and  " + message["driver2"])
            info_json = json.dumps(info)
            await send_message_to_client(info_json)

        elif type =="editStats":
            run_editStats(message["driverID"] + " " + message["typeStaff"] + " " + message["statsArray"])
            argument = type + " " + message["driverID"] + " " + message["typeStaff"] + " " + message["statsArray"]
            process_repack("../result", self.path)
            info = []
            info.insert(0, "Succesfully edited " + message["driver"] + "'s stats")
            info_json = json.dumps(info)
            await send_message_to_client(info_json)

        elif type=="calendar":
            run_editCalendar(message["calendarCodes"])
            process_repack("../result", self.path)
            argument = type + message["calendarCodes"]
            info = []
            info.insert(0, "Succesfully edited the calendar")
            info_json = json.dumps(info)
            await send_message_to_client(info_json)

        elif type=="requestDriver":
            contractDetails = self.dbutils.fetch_driverContract(message["driverID"])
            contractMsg = [contractDetails]
            contractMsg.append(self.dbutils.fetchDriverNumberDetails(message["driverID"]))
            contractMsg.insert(0, "Contract fetched")
            data_json_contract = json.dumps(contractMsg)
            await send_message_to_client(data_json_contract)
            nums = self.dbutils.fetch_driverNumebrs()
            nums.insert(0, "Numbers fetched")
            data_json_numbers = json.dumps(nums)
            await send_message_to_client(data_json_numbers)
            yearOfRetirement = self.dbutils.fetch_driverRetirement(message["driverID"])
            yearOfRetirement.insert(0, "Retirement fetched")
            data_json_year = json.dumps(yearOfRetirement)
            await send_message_to_client(data_json_year)

        elif type=="editContract":
            argument = "editContract " + message["salary"] + " " + message["year"] + " " + message["signBonus"] + " " + message["raceBonus"] + " " + message["raceBonusPos"] + " " +  str(message["driverID"]) + " " + str(message["driverNumber"]) + " " + str(message["wantsN1"]) + " " + str(message["retirementAge"])
            run_trasnsfer(argument)
            process_repack("../result", self.path)
            info = []
            info.insert(0, "Succesfully edited " + message["driver"] + "'s details")
            info_json = json.dumps(info)
            await send_message_to_client(info_json)

        elif type =="editPerformance":
            argument = message["teamID"] + " " + message["performanceArray"]
            run_editPerformance(argument)
            process_repack("../result", self.path)
            info = []
            info.insert(0, "Succesfully edited " + message["teamName"] + "'s car performance")
            info_json = json.dumps(info)
            await send_message_to_client(info_json)
            argument = "editPerformance " +  message["teamID"] + " " + message["performanceArray"]

        elif type=="editEngine":
            argument = message["engineID"] +  " " + message["teamEngineID"] + " " +  message["performanceArray"]
            run_editEngine(argument)
            process_repack("../result", self.path)
            info = []
            info.insert(0, "Succesfully edited all " + message["team"] + " engines performance")
            info_json = json.dumps(info)
            await send_message_to_client(info_json)

        elif type=="yearSelected":
            results = self.dbutils.fetch_seasonResults(message["year"])
            results.insert(0, self.dbutils.fetch_events_from(message["year"]))
            results.insert(0, "Results fetched")
            results.append(self.dbutils.fetch_teamsStadings(message["year"]))
            data_json_results = json.dumps(results)
            #argument = json.dumps(message)
            await send_message_to_client(data_json_results)

        elif type=="yearSelectedH2H":
            drivers = self.dbutils.fetch_drivers_per_year(message["year"])
            drivers.insert(0, "DriversH2H fetched")
            data_json_drivers = json.dumps(drivers)
            await send_message_to_client(data_json_drivers)

        elif type=="H2HConfigured":
            if(message["h2h"] != -1):
                if(message["mode"] == "driver"):
                    h2hRes = fetch_Head2Head((message["h2h"][0],), (message["h2h"][1],), (message["year"],))
                    h2h = ["H2H fetched", h2hRes]
                    data_json_h2h = json.dumps(h2h)
                    await send_message_to_client(data_json_h2h)
                elif(message["mode"] == "team"):
                    h2hRes = fetch_Head2Head_team((message["h2h"][0],), (message["h2h"][1],), (message["year"],))
                    h2h = ["H2H fetched", h2hRes]
                    data_json_h2h = json.dumps(h2h)
                    await send_message_to_client(data_json_h2h)
            h2hDrivers = []
            for id in message["graph"]:
                if(message["mode"] == "driver"):
                    res = self.dbutils.fetch_oneDriver_seasonResults((id,), (message["year"],))
                    h2hDrivers.append(res)
                elif(message["mode"] == "team"):
                    res = self.dbutils.fetch_oneTeam_seasonResults((id,), (message["year"],))
                    h2hDrivers.append(res)
            h2hDrivers.append(self.dbutils.fetch_events_done_from(message["year"]))
            h2hDrivers.insert(0, self.dbutils.fetch_events_from(message["year"]))
            h2hDrivers.insert(0, "H2HDriver fetched")
            data_json_h2hdrivers = json.dumps(h2hDrivers)
            await send_message_to_client(data_json_h2hdrivers)

        elif type=="teamRequest":
            teamData = fetch_teamData(message["teamID"])
            teamData.insert(0, "TeamData Fetched")
            data_json_teamData = json.dumps(teamData)
            await send_message_to_client(data_json_teamData)

        elif type=="editTeam":
            edit_team(message)
            process_repack("../result", self.path)
            info = ["Succesfully edited " + str(team_dict[message["teamID"]])]
            info_json = json.dumps(info)
            await send_message_to_client(info_json)
            argument = message["command"]

        elif type=="yearSelectedPrediction":
            events = [self.dbutils.fetch_predictable_events_from(message["year"])]
            events.insert(0, message["year"])
            events.insert(0, "Events to Predict Fetched")
            data_json_events = json.dumps(events)
            await send_message_to_client(data_json_events)

        elif type=="yearSelectedPredictionModal":
            events = [self.dbutils.fetch_predictable_events_from(message["year"])]
            events.insert(0, message["year"])
            events.insert(0, "Events to Predict Modal Fetched")
            data_json_events = json.dumps(events)
            await send_message_to_client(data_json_events)

        elif type=="predict":
            prediction = predict(message["race"], message["year"])
            prediction = list(prediction.values())
            prediction = sorted(prediction, key=lambda x: x['result'])
            pred_msg = ["Prediction Fetched", self.dbutils.fetch_next_race(), prediction]
            data_json_prediction = json.dumps(pred_msg)
            await send_message_to_client(data_json_prediction)

        elif type == "predictMontecarlo":
            perc = await montecarlo(message["race"], message["year"], client)
            perd_msg = ["Montecarlo Fetched", perc]
            data_json_montecarlo = json.dumps(perd_msg)
            await send_message_to_client(data_json_montecarlo)

        elif type=="unretireDriver":
            unretire(message["driverID"])
            process_repack("../result", self.path)
            info = []
            info.insert(0, "Succesfully unretired " + message["driver"])
            info_json = json.dumps(info)
            await send_message_to_client(info_json)

        self.log.write("[" + str(datetime.now()) + "] INFO: Command executed: " + logtxt + "\n")
        self.log.flush()


async def send_message_to_client(message):
    if client:
        await client.send(message)

async def handle_client(websocket, path, app_state):
    print("Client connected")
    global client
    client = websocket
    try:
        async for message in websocket:
            data = json.loads(message)
            await app_state.handle_command(data)
    except Exception as e:
        print(e)
        app_state.log.write("[" + str(datetime.now()) + "] EXCEPTION:" + str(e) + "\n")
        app_state.log.flush()
        info = []
        info.insert(0, "ERROR")
        info.insert(1, "Something went wrong. Please restart the tool")
        info_json = json.dumps(info)
        await send_message_to_client(info_json)
    finally:
        client = None
        # conn.commit()
        # conn.close()


async def main():
    log = open("../log.txt", 'a', encoding='utf-8')
    app_state = ApplicationState(log)
    await start_server(app_state)

async def start_server(app_state):
    server = await websockets.serve(lambda ws, path: handle_client(ws, path, app_state), "localhost", 8765)
    await server.wait_closed()


def create_backup(originalFIle, saveFile):
    backup_path = "./../backup"
    if not os.path.exists(backup_path):
        os.makedirs(backup_path)
    new_file = backup_path + "/" + saveFile
    shutil.copy(originalFIle, new_file)


asyncio.run(main())

