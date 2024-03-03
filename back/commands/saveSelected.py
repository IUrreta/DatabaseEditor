import json

class SaveSelectedCommand(Command):
    def __init__(self, message):
        super().__init__(message)
        self.save = message["save"]

    async def execute(self):
        argument = type + " " + self.save
        path = "../" + self.save
        self.dbutils.process_unpack(path, "../result")
        conn = sqlite3.connect("../result/main.db")
        dbutils = DatabaseUtils(conn)
        drivers = dbutils.fetch_info()
        drivers.insert(0, "Save Loaded Succesfully")
        data_json_drivers = json.dumps(drivers)
        await send_message_to_client(data_json_drivers)
        staff = dbutils.fetch_staff()
        staff.insert(0, "Staff Fetched")
        data_json_staff = json.dumps(staff)
        await send_message_to_client(data_json_staff)
        engines = dbutils.fetch_engines()
        engines.insert(0, "Engines fetched")
        data_json_engines = json.dumps(engines)
        await send_message_to_client(data_json_engines)
        calendar = dbutils.fetch_calendar()
        calendar.insert(0, "Calendar fetched")
        data_json_calendar = json.dumps(calendar)
        await send_message_to_client(data_json_calendar)
        create_backup(path, save)
        year =  dbutils.fetch_year()
        year = ["Year fetched", year]
        data_json_year = json.dumps(year)
        await send_message_to_client(data_json_year)