# Database Editor for F1 Manager 23 #
Friendly to use tool for editing your save files from F1 Manager 23. Supports driver transfers, calendar customization, staff stat editing and car eprfromance editing, but the tool is still in constant development!

**PLEASE KEEP IN MIND**: This are the first few iterations and will only get better with time. It will get regular updates to support more functionallity.

If you have any issues, I recommend first look at the Troubleshoot guide for the most common error: https://github.com/IUrreta/DatabaseEditor/wiki/Troubleshoot-guide. If this doesn't fix the error, you can open an Issue on GitHub

## What's the Database Editor? ##
Basically it's just a friendly user interface that helps you make the modifications you wish for the database from your save file from F1 Manager 23

It's developed by the same guy (me, u/ignaciourreta on Reddit) who developed multiple scripts for the F1 Manager 22 game as the driver trasnfer script, custom calendar, edit stats, or edit performance of cars

When I developed those scripts, more specifically the driver transfers script for the Script Manager for F1M22 I always had in mind to devlop a tool like this to make it easier to the user to take advantage of my scripts

### What can I actually edit with the Database Editor? ###

As of today, the supported functionalities are making driver transfers, editing driver stats and customizing the race calendar. Driver transfers include F1 official drivers, reserves, drivers from F2, F3, or even from their sofa if they have retired! Editing stats include any of all the stats that add up to form the overall rating of **ANY** staff from the game, including drivers, technical chiefs, race engineers etc.

Don't worry if there has been driver changes in your save, or if any staff memebr has gained or lost performance in any statistic. You'll be able to see those changes on the Database Editor. Just drag and drop the driver in a free space in any F1 team and you are done! No need to save changes for driver transfers. With the auto contract switch ON, the tool will automatically generate a contract for a driver when you move him into a new team, so you will not have to worry about it! (If you want to do it manually, just switch it off). You can also now edit the contract details of nay driver on the grid. Just put your mouse on top of it and an icon to allow you to edit them will pop up.

As for the calendar customization, there is the possibility to shuffle the races however you please, just drag and drop them wherever you want to place them. There is also support to choose what weekends will have the Spint format, as well as the Alternative Tyre Allocation format (Q1 on hards, Q2 on mediums and Q3 on softs). There is a maximum of 22 races per seaso, although you can remove any track that you don't like and add a repeated one. **KEEP IN MIND**: Due to how the script works, once you have deleted **at least** one track and **hit Save Changes**, you will no longer have the chance of adding new races in that season. You will be able to reshuffle them if you prefer them in other specific order, but no more adding races. While you don't press the **Save Changes** button, you are free to edit the calendar to your liking. I suggest editing the calendar as soon as you start a new season, your save integrity will not be guaranteed if you do it mid-through.

For the car performance editor, just sleect the team you want to buff or nerf, and click the `+` or `-` buttons to add or remove performance from that specific part. **KEEP IN MIND**: It's literally impossible for me to calculate how much a buff or a nerf on a part will affect laptimes, as it depends on a lot of factors (such as track type, driver etc.), so the percentage that you see on the right of the bar is just a numeric representation of the bar progress.

## What do I need to use the Database Editor? ##
You'll need to have installed on your computer 2 things: Python and NodeJS.

If you used the script manager last year you should already have python installed. If not, download it from here: https://www.python.org/downloads/ (MAKE SURE to tick the box that says add python to the PATH system variable or something similar)

For NodeJS, you can download it from here https://nodejs.org/en/download, just select the installer for your system. 

Now, if you have installed succesfully both of them, you should be able to run both py and npm commands on a cmd. You can do this for extra checking, but this is NOT MANDATORY.
If you don't like cmds, don't worry, I have designed this to not require you to use them. 

## How can I install the Database Editor? ##
So, if you have everything I mentioned installed, you just have to download this repository to be able to use the editor!

### Git installation (recommended) ##

If you don't have git installed, you can download it for windows here : [https://github.com/git-guides/install-git](https://gitforwindows.org/)

For cloning the repository (installing the tool), just create any folder **OUTSIDE ANY WINDOWS CONTRROLLED FOLDER** (Program Files, System32 etc.), your desktop for example is a good place, but feel free to choose other places. Then go into that folder in the Windows Explorer (`Win+E`) and type in the "Address bar" at the top: `cmd` and press `Enter`, like in the following picture:
![image](https://github.com/IUrreta/DatabaseEditor/assets/95303008/e0f8b123-0557-4783-a2dd-242eb12e7718)

This repository has mainly 1 usable branch: `release`. This branch will have the latest functional version. The `main` branch will also have functional versions but it's **NOT RECOMMENDED** for casual use. It should not but it **MAY** break at any time and software there will not be FINAL (ignore this paragraph if you're not familiar with git).

Once the black box (Command Prompt) opens, copy and paste this command and press Enter:

`git clone https://github.com/IUrreta/DatabaseEditor.git -b release`

This will clone the repo from the release branch, and you will have the tool installed.

### Zip installation (discouraged) ###

If you still don't want to clone the repo, just go into the [Releases](https://github.com/IUrreta/DatabaseEditor/releases) tab in it and hit `Source code(.zip)` from the **LATEST** release 

## How can I run the Databse Editor? ##

Once you have cloned/downloaded the repository, just paste the save file you want to edit into the `DatabaseEditor` folder. Your saves folder should be in `C:\Users\XXX\AppData\Local\F1Manager23\Saved\SaveGames` where `XXX` is your username. If the `AppData` folder does not appear go to `View > Show` in the `Windows Explorer` and then click on `Hidden elements`.

With your save inside the Database Editor folder, just double click on the `run.vbs` file and there you go! Everything else should install itself and the tool should open. Now you will be able to 
make any driver transfer you desire. I **HIGHLY RECOMMEND** to make a **BACKUP** of your file you're about to edit. To use the tool, select any save from the save selector and just drag and drop any driver into the spot you want to sign him into. To free a spot, just drag the driver that is occupying it and drop him into the Dree Drivers secion.

### How can I update the Database Editor if I had a previouos verision? ###

If you're still on the 1.3 or any previous version, the old method for updating will still work:

If installed through git, just go into your Database Editor folder, and type in the "Address bar" `cmd`, just like this: ![image](https://github.com/IUrreta/DatabaseEditor/assets/95303008/87cb051c-73fa-4590-8b7a-184058cfd0c1)

and then press `Enter`. When the command prompt opens up, copy and paste this commmand: `git pull`

If you installed using the .zip file, just download the latest one.

Now, for the 1.4 version, this is something that I have been working on an it's now easier than ever! Whenever you open the tool, it will automatically look if there's a new update out. If you're not connected to the internet, don't worry, this will show up on the footer: ![image](https://github.com/IUrreta/DatabaseEditor/assets/95303008/9a38df06-65eb-4fce-8b04-27deac52d964)
,
but you will still be able to keep using the tool.

If you are connected to the internet and you **INSTALLED THROUGH GIT**, adn there's an update available, you'll see thie:
![image](https://github.com/IUrreta/DatabaseEditor/assets/95303008/9cb4d880-f2db-4af2-a346-1209ac48c866)
,
just click it and the update will download and install **AUTOMATICALLY**, you won't have to do anything else. The tool will restart itself.
If when the tool restarts itself it opens 2 windows in stead of one, close both of them and open manually the tool manually. You should have tha latest version installed.

If, on the other hand, you installed downloading the zip, you'll see the same message but with a different icon:
![image](https://github.com/IUrreta/DatabaseEditor/assets/95303008/f35f7df7-34f3-4356-b542-5c5a7e8f6de9)
,
just click it and it will re direct you to the latest release available, so you can download it from there.

When you have the latest version available, you'll see this on the right bottom corner of the screen:

![image](https://github.com/IUrreta/DatabaseEditor/assets/95303008/481fec01-e020-47d8-82cb-a9804156bd28)


## FAQ ##

### I get an error saying "could not connect with backend". Have I done something wrong? ###

It most likely has something to do with a bad python installation. Not that you have a not-compatible version, but that you missed some of the steps to install it propperly. There's a complete guide on how to solve this in the [Troubleshoot Guide](https://github.com/IUrreta/DatabaseEditor/wiki/Troubleshoot-guide)

### My save files don't appear in the tool ###

There's another chapter covering that on the [Troubleshoot Guide](https://github.com/IUrreta/DatabaseEditor/wiki/Troubleshoot-guide)


### I can edit stats and do transfers, but then I don't see those changes applied to the game ###

One of two cases, either you didn't drop the save file you just edited back into the SavedGames folder on your F1 Manager 23 folder, or you pasted back the wrong file. If something goes wrong during using the tool or doesn't save, **YOU WILL GET AN ERROR SAYING IT**, if you don't see any erro, it means that everything has been done succesfully. This is also covered in the [Troubleshoot Guide](https://github.com/IUrreta/DatabaseEditor/wiki/Troubleshoot-guide)

### Why do I have to install Python and NodeJS? Isn't it Docker easier to use? ###

Actually, Docker might seem easier to use, but it's much more heavy in terms of size than installing only this two dependencies.
Also, this is done so you can just execute it with a double click, no more typing in your browser sketchy ip addresses that you don't understand😉


### Screenshots ###

![image](https://github.com/IUrreta/DatabaseEditor/assets/95303008/89baa8a5-7920-43b3-ab6a-cd88a1907918)

![image](https://github.com/IUrreta/DatabaseEditor/assets/95303008/1fec6164-4f5f-4364-97bd-31e6ea77ee81)

![image](https://github.com/IUrreta/DatabaseEditor/assets/95303008/914ba276-21bd-467c-9142-636362641a7f)

![image](https://github.com/IUrreta/DatabaseEditor/assets/95303008/823cd8f4-a3ab-4e8f-a8c2-1928b02f66d6)


### Special thanks ###
xAranaktu for the save repacker: https://github.com/xAranaktu/F1-Manager-2022-SaveFile-Repacker

Rolfeee for his design contribution: https://www.racedepartment.com/members/rolfeee.1369146/

F1 Manager Mods discord for the help during testing
