#!/bin/sh
# Builds RiesStory.apk without the Android SDK.
# Needs: aapt2 + android-framework.jar (from org.apktool:apktool-lib on Maven Central),
#        smali 2.5.2 (org.smali:smali), apksig 2.3.0 (com.android.tools.build:apksig), JDK.
# Usage: AAPT2=... FRAMEWORK=... SMALI_CP=... APKSIG=apksig.jar ./build.sh
set -e
OUT=build; rm -rf $OUT; mkdir -p $OUT
$AAPT2 compile --dir res -o $OUT/res.zip
$AAPT2 link -o $OUT/unsigned.apk -I $FRAMEWORK --manifest AndroidManifest.xml -A assets $OUT/res.zip --min-sdk-version 24 --target-sdk-version 34
java -cp "$SMALI_CP" org.jf.smali.Main assemble -a 21 -o $OUT/classes.dex smali
(cd $OUT && zip -q -j unsigned.apk classes.dex)
[ -f debug.jks ] || keytool -genkeypair -keystore debug.jks -storepass rie12345 -keypass rie12345 -alias rie -keyalg RSA -keysize 2048 -validity 10000 -dname "CN=Rie Game"
javac -cp "$APKSIG" -d $OUT tools/Sign.java
java --add-exports java.base/sun.security.x509=ALL-UNNAMED --add-exports java.base/sun.security.pkcs=ALL-UNNAMED --add-exports java.base/sun.security.util=ALL-UNNAMED -cp "$APKSIG:$OUT" Sign debug.jks rie12345 rie $OUT/unsigned.apk RiesStory.apk
rm -rf $OUT
