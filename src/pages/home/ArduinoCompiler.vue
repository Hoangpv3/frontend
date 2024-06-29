<script setup lang="ts">
import { ref } from 'vue';
import { Codemirror } from 'vue-codemirror';
//   import { javascript } from '@codemirror/lang-javascript'
import { cpp } from '@codemirror/lang-cpp';
import { oneDark } from '@codemirror/theme-one-dark';
import { submitArduinoCode, fetchArrayBuffer } from '@/api/submit';
import { fakeApi } from '@/api/common.api';
import { message } from 'ant-design-vue';
import type { SelectProps, UploadProps } from 'ant-design-vue';
import { UploadOutlined } from '@ant-design/icons-vue';
import PageLayout from '../layouts/PageLayout.vue';

let isLoading = ref<boolean>(false);
let code = ref<any>(`void setup() {
  pinMode(LED_BUILTIN, OUTPUT);
}

void loop() {
  digitalWrite(LED_BUILTIN, HIGH);
  delay(1000);
  digitalWrite(LED_BUILTIN, LOW);
  delay(1000);
}
`);
let codeOutput = ref<any>('');
let board = ref<any>('uno');
const uploadFileList = ref<UploadProps['fileList']>([]);
let uploadHexFile = ref<any>(null);
let compiledHexFile = ref<any>(null);

// const extensions = [javascript(), oneDark]
const extensions = [cpp(), oneDark];

const boardChoices = ref<SelectProps['options']>([
  { label: "Arduino Uno", value: "uno", tested: true },
  { label: "Arduino Mega", value: "mega", tested: false },
  { label: "Arduino ADK", value: "adk", tested: false },
  { label: "Arduino Nano", value: "nano", tested: false },
  { label: "Arduino Nano (with new bootloader)", value: "nano (new bootloader)", tested: false },
  { label: "Arduino Lilypad USB", value: "lilypad-usb", tested: false },
  { label: "Arduino Yun", value: "yun", tested: false },
  { label: "Arduino Esplora", value: "esplora", tested: false },
  { label: "Tiny Circuits Tinyduino", value: "tinyduino", tested: false },
  { label: "SparkFun Pro Micro	", value: "sf-pro-micro", tested: false },
  { label: "Qtechknow Qduino", value: "qduino", tested: false },
  { label: "Pinoccio Scout", value: "pinoccio", tested: false },
  { label: "Femtoduino IMUduino", value: "imuduino", tested: false },
  { label: "Adafruit Feather 32u4 Basic Proto", value: "feather", tested: false },
  { label: "Adafruit Circuit Playground", value: "circuit-playground-classic", tested: false },
  { label: "BQ ZUM", value: "bqZum", tested: false },
  { label: "BQ ZUM Core 2", value: "zumcore2", tested: false },
  { label: "BQ ZUM Junior	", value: "zumjunior", tested: false }
]);
const handleReady = () => { };

const handleChange = () => {
  // console.log(code.value);
};

const handleFocus = () => { };

const handleBlur = () => { };

const handleSubmit = async () => {
  isLoading.value = true;
  await submitArduinoCode({
    code: code.value,
    board: `arduino:avr:${board.value}`
  })
    .then((res: any) => {
      codeOutput.value = res.message;
      if (res.status == "success") {
        compiledHexFile.value = res.data;
      }
    })
    .catch((error: any) => {
      console.log('🚀 ~ file: Compiler.vue:42 ~ handleSubmit ~ error:', error);
      message.error(error?.response?.data ? error?.response?.data : 'Compile failed!');
      console.log(error);
    })
    .finally(() => {
      isLoading.value = false;
    });
  isLoading.value = false;
};

const beforeUploadHexFile: UploadProps['beforeUpload'] = file => {
  uploadFileList.value = [file];
  uploadHexFile.value = file;

  return false;
};

const handleUploadToArduino = async () => {
  // isLoading.value = true;
  if (uploadHexFile.value == null && compiledHexFile.value == null) {
    codeOutput.value = "hex file not found!";
    return;
  }
  codeOutput.value = "flashing...";

  if (uploadHexFile.value) {
    const reader = new FileReader();
    reader.readAsArrayBuffer(uploadHexFile.value);

    reader.onload = event => {
      const filecontents = event.target.result;

      const avrgirl = new AvrgirlArduino({
        board: board.value,
        debug: true,
        disableVerify: false
      });

      avrgirl.flash(filecontents, error => {
        if (error) {
          codeOutput.value = error.message;

        } else {
          console.info("flash successful");
          codeOutput.value = "Successfully flashed the Arduino!";
        }
      });
    };
  }
  else if (compiledHexFile.value) {
    var filecontents = await fetchArrayBuffer(compiledHexFile.value);
    const avrgirl = new AvrgirlArduino({
      board: board.value,
      debug: true,
      disableVerify: true
    });

    avrgirl.flash(filecontents, error => {
      if (error) {
        codeOutput.value = error.message;

      } else {
        console.info("flash successful");
        codeOutput.value = "Successfully flashed the Arduino!";
      }
    });
  }

  // isLoading.value = false;
};
</script>

<template>
  <page-layout :is-loading="isLoading">
    <div class="main-page">
      <a-row class="wrapper">
        <a-col :lg="24" :md="24">
          <codemirror v-model="code" placeholder="Code goes here..." :style="{ height: '400px' }" :autofocus="true"
            :indent-with-tab="true" :tab-size="2" :extensions="extensions" @ready="handleReady" @change="handleChange"
            @focus="handleFocus" @blur="handleBlur" />
        </a-col>
        <a-col :lg="24" :md="24">
          <a-row class="button-submit mb-10">

            <a-select class="mt-20" v-model:value="board" label-in-value style="width: 220px" :options="boardChoices"
              @change="handleChange"></a-select>

            <a-button class="mt-20 main-color text-second-color" @click="handleSubmit">
              Compile
            </a-button>
            <a-button class="mt-20 main-color text-second-color" @click="handleUploadToArduino">
              Upload to Arduino
            </a-button>

            <a-upload class="mt-20" :file-list="uploadFileList" :before-upload="beforeUploadHexFile" accept=".hex,.bin"
              :max-count="1" name="file">
              or
              <a-button>
                <upload-outlined></upload-outlined>
                Upload hex file
              </a-button>
            </a-upload>
          </a-row>

          <a-row :lg="16" :md="16">
            <a-textarea :value="codeOutput" :rows="5" :readonly="true"></a-textarea>
          </a-row>
        </a-col>
        <!-- <div>
                    <a-button @click="handleCallFakeApi">
                        Call Fake Api
                    </a-button>
                </div> -->
      </a-row>
    </div>
  </page-layout>
</template>

<style scoped>
@import '../../assets/styles/color.css';
@import '../../assets/styles/common.css';

.wrapper {
  height: 100% !important;
  display: flex;
  gap: 10px;
}

:deep(.cm-editor) {
  height: 500px;
}

.button-submit {
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
