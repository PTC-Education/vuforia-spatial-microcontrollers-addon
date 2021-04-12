# vuforia-spatial-microcontrollers-addon

This repository hosts a set of hardware interfaces for DIY and consumer
hardware. We hope that these interfaces will enable you to easily get started
creating compelling experiences with the Vuforia Spatial Toolbox and Vuforia
Spatial Edge Server.

## Read First
The Vuforia Spatial Toolbox and Vuforia Spatial Edge Server make up a shared research platform for exploring spatial computing as a community. This research platform is not an out of the box production-ready enterprise solution. Please read the [MPL 2.0 license](LICENSE) before use.

Join the conversations in our [discourse forum](https://forum.spatialtoolbox.vuforia.com) if you have questions, ideas want to collaborate or just say hi.

## Supported hardware

- micro:bit : Documentation coming soon
- Arduino NANO 33 IoT : Documentation coming soon

## Install
Once you have installed the Vuforia Spatial Edge Server clone this repo into the ```addons``` folder

```bash
cd addons
git clone https://github.com/PTC-Education/vuforia-spatial-microcontrollers-addon.git
```

Next, enter the vuforia-spatial-microcontrollers-addon directory and install all dependencies.

```bash
cd vuforia-spatial-microcontrollers-addon
npm install
```

## Prerequisites (for compiling the dependencies)

#### OS X

 * Install [Xcode](https://itunes.apple.com/ca/app/xcode/id497799835?mt=12)
 
 #### Windows

```cmd
npm install --global --production windows-build-tools
```
 
##### Ubuntu, Debian, Raspbian

```sh
sudo apt-get install bluetooth bluez libbluetooth-dev libudev-dev
```
