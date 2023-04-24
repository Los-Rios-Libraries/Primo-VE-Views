@echo off
set /p "view=Choose view: 01CACCL_LRCCD-"
cd ../../
gulp run --view 01CACCL_LRCCD-%view% --ve