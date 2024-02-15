<template>
  <main class="text-teal-950">
    <h1 class="text-3xl font-bold text-center mt-10">Column Transform</h1>
    <div class="flex w-[80vw] mx-auto mt-10">
      <div class="input card w-1/3 flex flex-col items-center px-5">
        <h3 class="text-xl font-bold mb-3">Input</h3>
        <textarea
          v-model="input"
          @keydown.shift.enter.prevent="transform"
          placeholder="Enter your list here"
        ></textarea>
      </div>
      <div
        class="transform card w-1/3 flex flex-col items-center text-center px-10"
      >
        <div class="preset mb-5">
          <div class="flex items-center justify-center gap-2">
            <label
              for="presets"
              class="block text-md font-bold text-gray-900 dark:text-white leading-none"
              >Preset</label
            >
            <div v-show="!_state.isEditingTitle" class="preset-select w-60">
              <select
                id="presets"
                v-model="preset.id"
                @change="changePreset"
                class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              >
                <option v-for="preset in presets" :value="preset.id">
                  {{ preset.id }}
                </option>
              </select>
            </div>
            <input
              v-show="_state.isEditingTitle"
              v-model="_state.newTitle"
              @change="savePresetTitle"
            />
            <div class="flex gap-1">
              <button @click="editPresetTitle" v-show="!_state.isEditingTitle">
                <SvgEdit class="w-6 h-6 p-[2px]" />
              </button>
              <button @click="savePresetTitle" v-show="_state.isEditingTitle">
                <SvgSave class="w-6 h-6 p-1" />
              </button>
              <button
                @click="savePreset"
                :disabled="!hasPresetChanges"
                :class="{ 'opacity-30': !hasPresetChanges }"
              >
                <SvgSave class="w-6 h-6 p-1" />
              </button>
              <button @click="createPreset">
                <SvgPlus class="w-6 h-6" />
              </button>
              <button @click="deletePreset">
                <SvgDelete class="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
        <button
          @click="transform"
          class="bg-teal-500 hover:bg-teal-600 text-stone-100 font-bold py-1 px-3 rounded-full mb-3"
        >
          Transform
        </button>
        <div class="progress mb-2" v-show="_state.isProcessing">
          <span v-show="_state.processStage == 'transform'">
            Processing... {{ index + 1 }}/{{ cells.length }}
          </span>
          <span v-show="_state.processStage == 'before'"> Initilizing... </span>
          <span v-show="_state.processStage == 'after'"> Finishing up... </span>
        </div>
        <div class="code_before w-full">
          <h3 class="text-xl font-bold mb-3">Code Before</h3>
          <textarea
            v-model="preset.codeBefore"
            @keydown.shift.enter.prevent="transform"
            placeholder="Enter script"
          ></textarea>
        </div>
        <div class="code_transform w-full">
          <h3 class="text-xl font-bold mb-3">Code Transform</h3>
          <textarea
            v-model="preset.codeTransform"
            @keydown.shift.enter.prevent="transform"
            placeholder="Enter script"
          ></textarea>
        </div>
        <div class="code_after w-full">
          <h3 class="text-xl font-bold mb-3">Code After</h3>
          <textarea
            v-model="preset.codeAfter"
            @keydown.shift.enter.prevent="transform"
            placeholder="Enter script"
          ></textarea>
        </div>
      </div>
      <div class="output card w-1/3 flex flex-col items-center">
        <h3 class="text-xl font-bold mb-3">Output</h3>
        <table>
          <thead class="">
            <tr class="hidden">
              <th>After</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="cell in output">
              <td>{{ cell }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </main>
</template>
<script setup>
import { deepClone, ignoreBuildOptimize } from '~/static/utils';
import { get, post } from '~/static/request';
import axios from 'axios';
import moment from 'moment';
import { dbDelete, getAll, getById, upsert, query, cache } from '~/static/db';
import { v4 } from 'uuid';

const app = inject('app');
const state = inject('state');
const data = inject('data');

const _state = reactive({
  isEditingTitle: false,
  newTitle: '',
  isProcessing: false,
  processStage: '', // before, transform, after
});

const hasPresetChanges = computed(() => {
  if (!preset.id) return false;
  const _preset = presets.value.find((p) => p.id === preset.id);
  if (!_preset) return false;
  return (
    _preset.codeBefore !== preset.codeBefore ||
    _preset.codeTransform !== preset.codeTransform ||
    _preset.codeAfter !== preset.codeAfter
  );
});

ignoreBuildOptimize([
  app,
  state,
  data,
  axios,
  moment,
  get,
  post,
  getById,
  dbDelete,
  query,
  cache,
]);

const input = ref('');
const cells = computed(() => {
  let delimiter;
  if (input.value.includes('\n')) delimiter = '\n';
  else if (input.value.includes(',')) delimiter = ',';
  else if (input.value.includes(';')) delimiter = ';';
  else if (input.value.includes('|')) delimiter = '|';
  else delimiter = ' ';
  return input.value.split(delimiter);
});

const preset = reactive({
  id: '',
  codeBefore: '',
  codeTransform: '',
  codeAfter: '',
});

const presets = ref([]);
onMounted(async () => {
  await nextTick();
  presets.value = (await getAll('column-preset')) || [];
  preset.id = presets.value[0]?.id;
  changePreset();
});

function changePreset() {
  const _preset = presets.value.find((p) => p.id === preset.id);
  if (!_preset) {
    alert('Preset not found');
    return;
  }
  preset.codeBefore = _preset.codeBefore;
  preset.codeTransform = _preset.codeTransform;
  preset.codeAfter = _preset.codeAfter;
}

function editPresetTitle() {
  _state.isEditingTitle = true;
  _state.newTitle = preset.id;
}

function savePresetTitle() {
  _state.isEditingTitle = false;
  const _preset = presets.value.find((p) => p.id === preset.id);
  if (!_preset) {
    alert('Preset not found');
    return;
  }
  _preset.id = _state.newTitle;
  upsert('column-preset', _preset);
  dbDelete('column-preset', preset.id);
  upsert('log', {
    id: v4(),
    name: _preset.id,
    type: 'preset',
    action: 'update',
    data: _preset,
  });
  preset.id = _state.newTitle;
}

function savePreset() {
  const existing = presets.value.find((p) => p.id === preset.id);
  existing.codeBefore = preset.codeBefore;
  existing.codeTransform = preset.codeTransform;
  existing.codeAfter = preset.codeAfter;
  upsert('column-preset', preset);
  upsert('log', {
    id: v4(),
    name: preset.id,
    type: 'preset',
    action: 'update',
    data: preset,
  });
}
function createPreset() {
  const _preset = {
    id: '',
    codeBefore: '',
    codeTransform: '',
    codeAfter: '',
  };
  _preset.id = prompt('Enter preset name');
  if (!_preset.id) return;
  const existing = presets.value.find((p) => p.id === _preset.id);
  if (existing) {
    alert('Preset already exists');
    return;
  }
  presets.value.push(_preset);
  upsert('column-preset', _preset);
}

function deletePreset() {
  if (!confirm('Are you sure you want to delete this preset?')) return;
  const index = presets.value.findIndex((p) => p.id === preset.id);
  if (index === -1) {
    alert('Preset not found');
    return;
  }
  presets.value.splice(index, 1);
  dbDelete('column-preset', preset.id);
}

const output = ref([]);

const index = ref(0);

async function transform() {
  _state.isProcessing = true;
  _state.processStage = 'before';
  cells.value = [];
  const _cells = deepClone(cells.value);
  const rows = cells.value;
  const _rows = deepClone(rows);
  ignoreBuildOptimize([_cells, _rows]);
  try {
    if (preset.codeBefore.trim() !== '') await eval(preset.codeBefore);
  } catch (error) {
    console.error('Evaluation failed:Code Before\n' + error);
  }
  _state.processStage = 'transform';
  for (let i = 0; i < cells.value.length; i++) {
    index.value = i;
    if (preset.codeTransform.trim() === '') {
      output.value[i] = cells.value[i];
      continue;
    }
    let value;
    const cell = cells.value[i];
    const _cell = _cells[i];
    const row = rows[i];
    const _row = _rows[i];
    ignoreBuildOptimize([cell, _cell, row, _row]);
    try {
      value = await eval(preset.codeTransform);
    } catch (error) {
      console.error('Evaluation failed:Code Transform\n' + error);
    }
    output.value[i] = value;
    if (value === undefined) output.value[i] = 'undefined';
    if (value === null) output.value[i] = 'null';
  }
  _state.processStage = 'after';
  try {
    if (preset.codeBefore.trim() !== '') await eval(preset.codeAfter);
  } catch (error) {
    console.error('Evaluation failed:Code After\n' + error);
  }
  _state.isProcessing = false;
  _state.processStage = '';
}
</script>
<style>
.card {
  @apply bg-white shadow-md rounded-md p-4 border border-gray-200;
}

textarea {
  @apply w-full h-32 p-2 border border-gray-300 rounded-md;
}

input {
  @apply w-full px-2 py-1 border-2 border-teal-300 rounded-md;
}
</style>
