# Database Editor for F1 Manager 23 #
Friendly to use tool for editing your save files from F1 Manager 23. Supports driver transfers, stat and calendar editing for now, but the tool is still in constant development!

**PLEASE KEEP IN MIND**: This are the first few iterations and will only get better with time. It will get regular updates to support more functionallity, and very likely it will get updates focusing on setting up if any issues come up

If you have any issues, I recommend first look at the Troubleshoot guide for the most common error: https://github.com/IUrreta/DatabaseEditor/wiki/Troubleshoot-guide. If this doesn't fix the error, you can open an Issue on GitHub

## What's the Database Editor? ##
Basically it's just a friendly user interface that helps you make the modifications you wish for the databasde from your save file from F1 Manager 23

It's developed by the same guy (me, u/ignaciourreta on Reddit) who developed multiple scripts for the F1 Manager 22 game as the driver trasnfer script, custom calendar, edit stats, or edit performance of cars

When I developed those scripts, more specifically the driver transfers script for the Script Manager for F1M22 I always had in mind to devlop a tool like this to make it easier to the user to take advantage of my scripts

### What can I actually edit with the Database Editor? ###

As of today, the supported functionalities are making driver transfers, editing driver stats and customizing the race calendar. Driver transfers include F1 official drivers, reserves, drivers from F2, F3, or even from their sofa if they have retired! Editing stats include any of the 9 stats that add up to calculate the overall rating of the driver, plus their growth and aggression. 

Don't worry if there has been driver changes in your save, or if any driver has gained or lost performance in any statistic. You'll be able to see those changes on the Database Editor. Just drag and drop the driver in a free space in any F1 team and you are done! No need to save changes for driver transfers. With the auto contract switch ON, the tool will automatically generate a contract for a driver when you move him into a new team, so you will not have to worry about it! (If you want to do it manually, just switch it off)

As for the calendar customization, there is the possibility to shuffle the races however you please, just drag and drop them wherever you want to place them. There is also support to choose what weekends will have the Spint format, as well as the Alternative Tyre Allocation format (Q1 on hards, Q2 on mediums and Q3 on softs). There is a maximum of 22 races per seaso, although you can remove any track that you don't like and add a repeated one. **KEEP IN MIND**: Due to how the script works, once you have deleted **at least** one track and **hit Save Changes**, you will no longer have the chance of adding new races in that season. You will be able to reshuffle them if you prefer them in other specific order, but no more adding races. While you don't press the **Save Changes** button, you are free to edit the calendar to your liking. I suggest editing the calendar as soon as you start a new season, your save integrity will not be guaranteed if you do it mid-through.

## What do I need to use the Database Editor? ##
You'll need to have installed on your computer 2 things: Python and NodeJS.

If you used the script manager last year you should already have python installed. If not, download it from here: https://www.python.org/downloads/ (MAKE SURE to tick the box that says add python to the PATH system variable or something similar)

For NodeJS, you can download it from here https://nodejs.org/en/download, just select the installer for your system. 

Now, if you have installed succesfully both of them, you should be able to run both py and npm commands on a cmd. You can do this for extra checking, but this is NOT MANDATORY.
If you don't like cmds, don't worry, I have designed this to not require you to use them. 

## How can I run the Database Editor? ##
So, if you have everything installed, you just have to download this repository to be able to use the editor!

If you know how to use git and have it installed, just clone this repository wherever you desire.
**I HIGHLY RECOMMEND** to use git as it will be much easier to update the editor in the future. Here is a guide to install it (don't worry, it's not complicated): https://github.com/git-guides/install-git

This repository has mainly 1 usable branch: `release`. This branch will have the latest functional version. The `main` branch will also have functional versions but it's **NOT RECOMMENDED** for casual use. It should not but it **MAY** break at any time and software there will not be FINAL.


For cloning the repo, just create any folder **OUTSIDE ANY WINDOWS CONTRROLLED FOLDER** (Program Files, System32 etc.), your desktop for example is a good place, but feel free to choose
other places. Then go into that folder in the Windows Explorer (`Win+E`) and type in the "Address bar" at the top: `cmd` and press Enter.

Once the black box (Command Prompt) opens, copy and paste this command and press Enter:

`git clone https://github.com/IUrreta/DatabaseEditor.git -b release`

This will clone the repo from the release branch

If you still don't want to clone the repo, just hit the green button that reads "Code" in it and click the download Zip option. Extract the files where you want and you should have the files from the editor ready.

Once you have cloned/downloaded the repository, just paste the save file you want to edit into the DatabaseEditor folder. Your saves folder should be in C:\Users\XXX\AppData\Local\F1Manager23\Saved\SaveGames where XXX is your username. If the AppData folder does not appear go to View in windows explorer and then click on hidden elements.

With your save inside the Database Editor folder, just double click on the run.vbs file and there you go! Everything else should install itself and the tool should open. Now you will be able to 
make any driver transfer you desire. I **HIGHLY RECOMMEND** to make a **BACKUP** of your file you're about to edit. To use the tool, select any save from the save selector and just drag and drop any driver into the spot you want to sign him into. To free a spot, just drag the driver that is occupying it and drop him into the Dree Drivers secion.

### How can I update the Database Editor if I had a previouos verision? ###

It's actually super easy. If you cloned the repository from github, just open the repository location in your file eplorer folder (`Win + E`) and type in the "Address bar" `cmd` and press `Enter`. Then, a black box (Command prompt) will appear. Copy and paste this command: `git pull` and press `Enter` again. Everything should download automatically. 

If, on the other hand, you just downloaded the zip with the files, it's the same process again! Download the zip, extract the files and you should be good to go!


### Screenshots ###

![image](https://github.com/IUrreta/DatabaseEditor/assets/95303008/a7c4acb2-5054-4b41-8ae6-4de8c2e87b7e)

![image](https://github.com/IUrreta/DatabaseEditor/assets/95303008/a8481cf2-e01a-4ac3-8239-9af8230337f6)

![image](https://github.com/IUrreta/DatabaseEditor/assets/95303008/01d36c8c-f8ac-4d76-af38-188f2a94ef24)




