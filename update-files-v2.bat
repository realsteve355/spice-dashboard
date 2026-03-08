@echo off
echo Updating SPICE Dashboard files (with upgraded Collision model)...

copy /Y App.jsx src\App.jsx
copy /Y Home.jsx src\pages\Home.jsx
copy /Y Dashboard.jsx src\pages\Dashboard.jsx
copy /Y Collision.jsx src\pages\Collision.jsx
copy /Y collision.html public\collision.html

echo.
echo All files updated successfully!
echo Remember to close all VS Code tabs (Ctrl+K then W, Don't Save) and reopen them.
echo.
pause
