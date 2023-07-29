# Database Editor for F1 Manager 23 #
Friendly to use tool for editing your save files from F1 Manager 23. Supports driver transfers for now, but more options will be added in the future!

**PLEASE KEEP IN MIND**: This is the first version and will only get better with time. It will get regular updates to support more functionallity, and veruy likely it will get 
updates focusing on setting up if any issues come up

## What's the Database Editor? ##
Basically it's just a friendly user interface that helps you make the modifications you wish for the databasde from your save file from F1 Manager 23

It's developed by the same guy (me, u/ignaciourreta on Reddit) who developed multiple scripts for the F1 Manager 22 game as the driver trasnfer script, custom calendar, edit stats, or edit performance of cars

When I developed those scripts, more specifically the driver transfers script for the Script Manager for F1M22 I always had in mind to devlop a tool like this to make it easier to the user to take advantage of my scripts

## What do I need to use thge Database Editor? ##
You'll need to have isntalled on your computer 2 things: Python and NodeJS.

If you used the script manager last year you should already have pytho installed. If not, download it from here: https://www.python.org/downloads/ (MAKE SURE to tick the box that says add python to the PATH system variable or something similar)

For NodeJS, you can download it from here https://nodejs.org/en/download, just select the installer for your system. 

Now, if you have installed succesfully both of them, you should be able to run both py and npm commands on a cmd. You can do this for extra checking, but this is NOT MANDATORY.
If you don't like cmds, don't worry, I have designed this to not require you to use them. 

## How can I run the Database Editor? ##
So, if you have everything installed, you just have to download this repository to be able to use the editor!

If you know how to use git and have it installed, just clone this repository wherever you desire.
**I HIGHLY RECOMMEND** to use git as it will be much easier to update the editor in the future. Here is a guide to install it (don't worry, it's not complicated): https://github.com/git-guides/install-git

This repository has mainly 1 usable branch: `release`. This branch will have the latest functional version. The `main` branch will also have functional versions but it's **NOT RECOMMENDED** for casual use. It should not but it **MAY** break at any time and software there will not be FINAL.


For cloning the repo, just create any folder **OUTSIDE ANY WINDOWS CONTRROLLED FOLDER** (Program Files, System32 etc.), your desktop for example is a good place, but feel free to choose
other places. Then go into that folder in the Windows Explorer (Win+E) and type in the "Address bar" at the top: `cmd` and press Enter.

Once the black box (Command Prompt) opens, copy and paste this command and press Enter:

`git clone https://github.com/IUrreta/DatabaseEditor.git -b release`

This will clone the repo from the release branch

If you still don't want to clone the repo, just hit the green button that reads "Code" in it and click the download Zip option. Extract the files where you want and you should have the files from the editor ready.

Once you have cloned/downloaded the repository, just paste the save file you want to edit into the DatabaseEditor folder. Your saves folder should be in C:\Users\XXX\AppData\Local\F1Manager23\Saved\SaveGames where XXX is your username. If the AppData folder does not appear go to View in windows explorer and then click on hidden elements.

With your save inside the Database Editor folder, just double click on the run.vbs file and there you go! everything else should install itself and the tool should open. Now you will be able to 
make any driver transfer you desire. I **HIGHLY RECOMMEND** to make a **BACKUP** of your file you're about to edit. To use the tool, select any save from the save selector and just drag and drop any driver into the spot you want to sign him into. To free a spot, just drag the driver that is occupying it and drop him into the Dree Drivers secion.

### Screenshot ###

![image](https://github.com/IUrreta/DatabaseEditor/assets/95303008/907a39e6-ed48-4196-9a51-ab10bbe8969c)

