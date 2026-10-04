#!/bin/sh
# Builds RiesStory.apk without the Android SDK.
# Needs: aapt2 + android-framework.jar (from org.apktool:apktool-lib on Maven Central),
#        smali 2.5.2 (org.smali:smali), JDK keytool/jarsigner.
# Usage: AAPT2=... FRAMEWORK=... SMALI_CP=... ./build.sh
set -e
OUT=build; rm -rf $OUT; mkdir -p $OUT
$AAPT2 compile --dir res -o $OUT/res.zip
$AAPT2 link -o $OUT/unsigned.apk -I $FRAMEWORK --manifest AndroidManifest.xml -A assets $OUT/res.zip --min-sdk-version 21 --target-sdk-version 28
java -cp "$SMALI_CP" org.jf.smali.Main assemble -a 21 -o $OUT/classes.dex smali
(cd $OUT && zip -q -j unsigned.apk classes.dex)
[ -f debug.jks ] || keytool -genkeypair -keystore debug.jks -storepass rie12345 -keypass rie12345 -alias rie -keyalg RSA -keysize 2048 -validity 10000 -dname "CN=Rie Game"
jarsigner -keystore debug.jks -storepass rie12345 -sigalg SHA256withRSA -digestalg SHA-256 -signedjar RiesStory.apk $OUT/unsigned.apk rie
rm -rf $OUT
