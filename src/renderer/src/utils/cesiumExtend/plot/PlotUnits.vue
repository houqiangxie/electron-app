<template>
  <el-form class="plotUnitsForm" :label-width="styleConfig?.labelWidth || '80px'" :model="formData" ref="PlotUnitsRef">
    <el-row>
      <el-col :span="item.span || 24" v-for="item in configList" :key="item.label">
        <el-form-item
          :label="item.label"
          :class="item.id + '-unit ' + item.unitType + '-block'"
          v-if="showItem ? item.show || showItem?.some((o) => o == item.showType) : item.show !== false"
          :required="item.required"
          :rules="rulesFn(item)"
          :prop="item.id"
        >
          <!-- -->
          <template v-if="item.unitType == 'ElColorPicker' && item.defaultColor">
            <!-- <span :style="{background:ob,height:'22px',width:'38px'}"
          v-for="ob in item.defaultColor" :key="ob"
          >{{ob}}</span> -->
            <el-radio
              v-for="ob in item.defaultColor"
              :key="ob"
              :style="{ background: ob }"
              v-model="formData[item.id]"
              :label="ob"
              :size="item.size"
            ></el-radio>
          </template>
          <!-- <el-scrollbar :maxHeight="item.maxHeight||'auto'" width="100%" style="flex: 1;"> -->
          <component
            :is="unitsList[item.unitType]"
            v-model="formData[item.id]"
            :formData="formData"
            :unitConfig="item"
            v-bind="item.vBind || {}"
            v-on="unitAppendOn(item)"
            @change="changeFn(item, formData[item.id])"
          >
            <template v-slot:[item.vSlot.name]="slotScope" v-if="item.vSlot">
              <!-- 配置参考 {{item.vSlot}} -->
              <span v-html="item.vSlot?.html(formData, item, slotScope)"></span>
            </template>
            <template v-if="item.unitType == 'ElSelect'">
              <el-option :label="ob.label" :value="ob.imgUrl || ob.value" v-for="ob in item.option || []" :key="ob.value">
                <span class="overflow-hidden block overflow-ellipsis">
                  <span v-html="item.vSlot?.optionSlot(item, ob)" v-if="item.vSlot?.optionSlot"></span>
                  <template v-else>{{ ob.label }}</template>
                </span>
              </el-option>
            </template>
            <template v-else-if="item.unitType == 'ElCheckboxGroup'">
              <el-checkbox :label="ob.label" v-model="ob.value" v-for="ob in item.option || []" :key="ob.value"></el-checkbox>
            </template>
            <template v-else-if="item.unitType == 'ElRadioGroup'">
              <el-radio :label="ob?.label ?? ob" v-for="ob in item.option || []" :key="ob?.label ?? ob">
                <span v-html="item.itemHtml(formData, item, ob)" v-if="item.itemHtml"></span>
                <template v-else>{{ ob }}</template>
                <!-- <img :src="formData.imgUrl" :width="formData.imgUrl?ob*15:0"/> -->
              </el-radio>
            </template>
          </component>
          <span v-html="item.vSlot.unitAppend(formData, item)" v-on="unitAppendOn(item)" v-if="item.vSlot?.unitAppend"></span>
          <!-- </el-scrollbar> -->
        </el-form-item>
      </el-col>
    </el-row>
  </el-form>
</template>
<script lang="ts" setup>
import AddressUnit from '@/components/web/components/ResourceSchedulingComponents/components/AddressUnit.vue';
import AreaTreeUnit from '@/components/web/components/ResourceSchedulingComponents/components/AreaTreeUnit.vue';
const unitsList: any = ref({
  // 引入动态组件
  ElInput: shallowRef(ElInput),
  ElInputNumber: shallowRef(ElInputNumber),
  ElSelect: shallowRef(ElSelect),
  ElCheckboxGroup: shallowRef(ElCheckboxGroup),
  ElUpload: shallowRef(ElUpload),
  ElImage: shallowRef(ElImage),
  ElRadioGroup: shallowRef(ElRadioGroup),
  ElColorPicker: shallowRef(ElColorPicker),
  ElSlider: shallowRef(ElSlider),
  ElTree: shallowRef(ElTree),
  AddressUnit: shallowRef(AddressUnit),
  AreaTreeUnit: shallowRef(AreaTreeUnit),
});
interface Props {
  formData: any;
  showItem?: number[] | string[];
  styleConfig?: object;
  config: object[] | object;
}
const props = withDefaults(defineProps<Props>(), {
  formData: {},
  // showItem: () =>[],
  config: () => [],
});
const configList = computed(() => {
  let res = [];
  if (!Array.isArray(props.config)) {
    for (let [k, val] of Object.entries(props.config)) {
      res.push({ ...val, id: k });
    }
  } else {
    res = props.config;
  }
  return res;
});
function rulesFn(item: any) {
  return { required: item.required, message: item.hasOwnProperty('msg') ? item.msg : item.label + ' 不能为空！' };
}
const PlotUnitsRef = ref();
const emits = defineEmits(['changeEmits']);
function unitAppendOn(item: any) {
  let loadOn = item.vOn ?? item.vSlot?.unitAppendOn ?? {};
  const params: any = {}; // 防止污染
  for (let key in loadOn) {
    params[key] = () => loadOn[key](item, props.formData);
  }
  return params;
}
function changeFn(item: any, val: any) {
  emits('changeEmits', item, val);
}
defineExpose({ PlotUnitsRef });
</script>
<style lang="scss" scoped>
.plotUnitsForm {
  :deep(.ElColorPicker-block) {
    .el-radio {
      margin-right: 5px;
      width: 30px;
      height: 22px;
      border-radius: 4px;
      border: 2px solid transparent;
      &.is-checked {
        border-color: #ffffff;
        box-shadow: 0 0 0 2px #1e90ff;
      }
      .el-radio__input,
      .textColor {
        display: none;
      }
      .el-radio__label {
        display: none !important;
      }
    }
  }
}
</style>
