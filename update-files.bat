@echo off
echo Updating SPICE Dashboard files...

copy /Y App.jsx src\App.jsx
copy /Y Home.jsx src\pages\Home.jsx
copy /Y Dashboard.jsx src\pages\Dashboard.jsx
copy /Y Collision.jsx src\pages\Collision.jsx

echo.
echo Files updated successfully!
echo.
pause
