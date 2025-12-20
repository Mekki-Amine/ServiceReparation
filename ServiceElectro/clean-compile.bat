@echo off
echo Nettoyage du projet Maven...
call mvn clean
echo.
echo Compilation du projet Maven...
call mvn compile
echo.
echo Termine!

