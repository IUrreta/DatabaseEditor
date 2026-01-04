## 12th november
- Added driver's reactions news after each race weekend with quotes from them

## 17th november
- Made transfer rumors more interesting (should talk about better drivers always first)
- Added more news options for transfers of very highly rated drivers
- Changed Max Verstappen paddock's picture

## 27th november
- New landing page with more modern design
- Removed backgrounds for toolbar and footer
- Refactor of the main function to access the DB (user shouldn't notice)
- Added "Recents" save files in landing page
- Added Patreon Oauth and removed "Patreon Key" system

## 11th december
- Redesigned the teams tab
- Moved from Google's API to OpenAI's API for news generations
- Added dropdown to viuew news from past years
- Changed news context from text based format to JSON format to reduce costs
- Introduced some soft rate limits for testing

## 13th december
- Added rate limit info on Settings -> Patreon
- Updated styles for most dropdowns
- Fixed a bug that broke the comparison graph
- Increased rate limits for all tiers (still provisional)

## 14th december
- Rollback to text-formatted context to test model behaviour
- Adjusted messages about rate limits for the day

## 15th december
- Added "next season grid" news at the end of the season
- Slightly changed the style of the query limit display

## 16th december
- Adjusted fill abr style for request limit to represent requests left, not used
- Added copy article button
- Added edit article button
- Add glow spot on landing page to follow mouse

## 18th december
- Added editing title in edit article mode
- Added delete article button   

## 22nd december
- Added engine regulations turning point at the end of the season (not guaranteed every season)
- Added junior drivers boost turning point at the end of every season
- Added F2/F3 standings in the records tab (only for current season)
- Redesigned the difficulty selector and removed 2 dificulty options
- Added F2/F3 buttons on the Calendar tab for each race to customize F2/F3 races
- Added news translations dropdown on the news tab
- Updated the style of the transfer modal
- Added the possibility to reomve "Recent" saves by hovering and clicking on their timestamp
- Upodated the style of many buttons across the whole UI, and added new progressive buttons to the performance tab
- Fixed the issue with double points being awarded if a DSQ turning point was accepted, even if it wasn't the last race. If your save is affected by this bug, it should ask you if you want to fix it

## 26th december
- Added empty circles as indicators for affiliates future contracts
- Added F2/F3 logos for junior drivers in transfers tab
- Added F2/F3 tab in contract modal to move drivers to F2/F3 teams

# 30th december
- Added **Regulations** tab to allow players to change Cost cap, engine part limit, points reglations, CFD/WT allocations, etc.
- Updated Williams logo and color for the 2026 season
- **Transfers** tab now has the teams ordered by last year's constructor's championship
- Updated other team's colors

## 2nd january 2026
- Added turning points probability slider, to make them more or less often
- Added a progress bar when downloading a save file
- Changed the style of filters in **Transfers** and **Attributes** tab
- Added F2/F3 "Season review" new at the end of each season
- Fixed an issue with team names on performance tab (individual cars) when replacing one team with another one
- Fixed an bug that would cause news about a driver being champion in a race that hadn't been done yet
- Minor UI changes on the landing page

## 3rd january 2026
- Added more photos to race reactions news
- Added overlay to race reacition news
- Minor UI changes for **Regulations** tab
- Minor animations added when loading a save file

## 4th january
- Added overlays to transfer news
- Added point for pole position in F1 standings in Records tab