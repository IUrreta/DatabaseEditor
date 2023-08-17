import sqlite3
import decimal

values_minimum = [9, 9, 6.5, 7, 8.5]
values_relative = [1000, 1000, -500, 666.6, 666.6]

def run_script(option=""):
    conn = sqlite3.connect("../result/main.db")
    cursor = conn.cursor()
    
    text = option.lower()
    params = text.split()

    engine_id = params[0]
    values = params[1:6]

    new_valuesList = []

    for i in range(len(values)):
        if i != 2:
            newValue = 0
        else:
            newValue = 1000
        dif = abs(float(values[i]) - float(values_minimum[i]))
        dif = round(dif, 3)
        delta = dif*values_relative[i]
        newValue += delta
        newValue = round(newValue)
        print(delta, newValue)
        new_valuesList.append(newValue)

    print(new_valuesList)



    conn.commit()
    conn.close()