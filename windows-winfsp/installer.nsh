!macro customInstall
${ifNot} ${isUpdated}
  File /oname=$PLUGINSDIR\winfsp.msi "${BUILD_RESOURCES_DIR}\winfsp.msi"
  ExecWait '"msiexec" /i "$PLUGINSDIR\winfsp.msi" /passive'
${endIf}
!macroend