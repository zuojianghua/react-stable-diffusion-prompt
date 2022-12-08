import * as React from 'react';
import './style.css';
import {
  Col,
  Row,
  Divider,
  Typography,
  Input,
  Select,
  Button,
  Form,
  FormInstance,
} from 'antd';
const { Title, Paragraph, Text, Link } = Typography;
const { TextArea } = Input;
import { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { initDB, useIndexedDB } from 'react-indexed-db';

// 翻译接口
// const translateUrl = `https://fanyi.youdao.com/translate?doctype=json&type=ZH_CN2EN&i=`;
const translateUrl = `https://service-f0uyu9db-1256086461.sh.apigw.tencentcs.com/a?i=`;

// 本地离线数据初始化配置
const DBConfig = {
  name: 'PromptDB',
  version: 1,
  objectStoresMeta: [
    {
      store: 'prompt',
      storeConfig: { keyPath: 'id', autoIncrement: true },
      storeSchema: [
        { name: 'name', keypath: 'name', options: { unique: false } },
        { name: 'context', keypath: 'context', options: { unique: false } },
      ],
    },
  ],
};

try {
  initDB(DBConfig);
} catch (e) {}

// 各类选项参数
const dataView = [
  { value: 'Ultra-wide angle', label: '超广角' },
  { value: 'wide angle', label: '广角' },
  { value: 'panorama', label: '全景' },
  { value: 'fisheye lenses', label: '鱼眼' },
  { value: 'Telephoto', label: '长焦' },
  { value: 'close-up', label: '特写' },
  { value: 'macro lens', label: '微距' },
  { value: 'tilt-shift lens', label: '移轴' },
  { value: 'top-down view', label: '俯瞰' },
  { value: 'full body', label: '全身人像' },
  { value: 'low angle', label: '低角度' },
  { value: 'isometric view', label: '轴测图' },
];

const dataType1 = [
  { value: 'landscape', label: '风景' },
  { value: 'portrait', label: '人像' },
  { value: 'scene graph', label: '场景' },
];

const dataType2 = [
  { value: 'painting', label: '画作' },
  { value: 'oil painting', label: '油画' },
  { value: 'gouache', label: '水粉画' },
  { value: 'sketch', label: '素描' },
  { value: 'chinese ink painting', label: '水墨画' },
  { value: 'matte painting', label: '哑光画' },
  { value: 'illustration', label: '插画' },
  { value: 'photography', label: '摄影作品' },
  { value: 'movie stills', label: '剧照' },
  { value: 'movie poster', label: '海报' },
  { value: 'concept art', label: '概念艺术' },
  { value: 'digital painting', label: '数字艺术' },
  { value: 'game concept art', label: '游戏概念' },
];

// @link https://www.917118.com/tool/color_1.html
const dataColor = [
  { value: 'colorful', label: '色彩斑澜' },
  { value: 'black and white', label: '黑白' },
  { value: 'monochrome', label: '单色' },
  { value: 'cool colors', label: '冷色调' },
  { value: 'warm colors', label: '暖色调' },
  { value: 'rainbow colors', label: '彩虹色' },
  { value: 'black', label: '纯黑' },
  { value: 'white', label: '纯白' },
  { value: 'LightPink', label: '浅粉红' },
  { value: 'Pink', label: '粉红' },
  { value: 'Crimson', label: '猩红' },
  { value: 'LavenderBlush', label: '脸红的淡紫色' },
  { value: 'PaleVioletRed', label: '苍白的紫罗兰红色' },
  { value: 'HotPink', label: '热情的粉红' },
  { value: 'DeepPink', label: '深粉色' },
  { value: 'MediumVioletRed', label: '紫罗兰红色' },
  { value: 'Orchid', label: '兰花紫' },
  { value: 'Violet', label: '紫罗兰' },
  { value: 'Magenta', label: '洋红' },
  { value: 'Fuchsia', label: '灯笼海棠紫' },
  { value: 'DarkMagenta', label: '深洋红色' },
  { value: 'Purple', label: '紫色' },
  { value: 'DarkVoilet', label: '深紫罗兰色' },
  { value: 'DarkOrchid', label: '深兰花紫' },
  { value: 'Indigo', label: '靛青' },
  { value: 'DarkSlateBlue', label: '深岩暗蓝灰色' },
  { value: 'Lavender', label: '熏衣草淡紫' },
  { value: 'GhostWhite', label: '幽灵白' },
  { value: 'Blue', label: '蓝色' },
  { value: 'MediumBlue', label: '适中的蓝色' },
  { value: 'MidnightBlue', label: '午夜蓝' },
  { value: 'DarkBlue', label: '深蓝色' },
  { value: 'Navy', label: '海军蓝' },
  { value: 'RoyalBlue', label: '皇家蓝' },
  { value: 'DoderBlue', label: '道奇蓝' },
  { value: 'SteelBlue', label: '钢蓝' },
  { value: 'LightSkyBlue', label: '淡蓝色' },
  { value: 'SkyBlue', label: '天蓝色' },
  { value: 'DeepSkyBlue', label: '深天蓝' },
  { value: 'LightBLue', label: '淡蓝' },
  { value: 'Azure', label: '蔚蓝色' },
  { value: 'LightCyan', label: '淡青色' },
  { value: 'Cyan', label: '青色' },
  { value: 'DarkTurquoise', label: '深绿宝石' },
  { value: 'DarkCyan', label: '深青色' },
  { value: 'Turquoise', label: '宝石绿' },
  { value: 'SpringGreen', label: '春天绿' },
  { value: 'SeaGreen', label: '海洋绿' },
  { value: 'LightGreen', label: '淡绿色' },
  { value: 'DarkSeaGreen', label: '深海洋绿' },
  { value: 'LimeGreen', label: '柠檬绿' },
  { value: 'ForestGreen', label: '森林绿' },
  { value: 'Green', label: '绿色' },
  { value: 'DarkGreen', label: '深绿色' },
  { value: 'GreenYellow', label: '黄绿' },
  { value: 'Beige', label: '米色' },
  { value: 'Ivory', label: '象牙白' },
  { value: 'LightYellow', label: '浅黄' },
  { value: 'Yellow', label: '黄色' },
  { value: 'DarkKhaki', label: '深卡其色' },
  { value: 'Gold', label: '金色' },
  { value: 'FloralWhite', label: '花白' },
  { value: 'Wheat', label: '小麦色' },
  { value: 'Orange', label: '橙色' },
  { value: 'DarkOrange', label: '深橙色' },
  { value: 'PeachPuff', label: '桃色' },
  { value: 'Chocolate', label: '巧克力色' },
  { value: 'OrangeRed', label: '橙红' },
  { value: 'IndianRed', label: '印度红' },
  { value: 'Red', label: '红色' },
  { value: 'Brown', label: '棕色' },
  { value: 'DarkRed', label: '深红色' },
  { value: 'LightGrey', label: '浅灰' },
  { value: 'Silver', label: '银色' },
  { value: 'DarkGray', label: '深灰' },
  { value: 'Gray', label: '灰色' },
];

const onChange = (value: string) => {
  console.log(`selected ${value}`);
};

const onSearch = (value: string) => {
  console.log('search:', value);
};

const dataStyles = [
  { value: 'anime comics', label: '二次元' },
  { value: 'realistic', label: '写实' },
  { value: 'manga', label: '漫画' },
  { value: 'lego', label: '乐高风格' },
  { value: 'disney', label: '迪士尼风格' },
  { value: 'pixar', label: '皮克斯动画' },
  { value: 'cyberpunk', label: '赛博朋克' },
  { value: 'steampunk', label: '蒸汽朋克' },
  { value: 'sci-fi', label: '科幻' },
  { value: 'cthulhu', label: '克苏鲁' },
  { value: 'chinoiserie', label: '中国风' },
  { value: 'low poly', label: 'low poly' },
];

const dataAuthor = [
  { value: 'Van Gogh', label: '梵高' },
  { value: 'Rembrandt', label: '伦勃朗' },
  { value: 'Da vinci', label: '达芬奇' },
  { value: 'Picasso', label: '毕加索' },
  { value: 'Kandinsky', label: '康丁斯基' },
  { value: 'Paul Klee', label: '保罗克利' },
  { value: 'Monet', label: '莫奈' },
  { value: 'Alphonse Mucha', label: '慕夏' },
  { value: 'Beeple', label: 'Beeple' },
  { value: 'wolp', label: 'wolp' },
  { value: 'Yoneyama Mai', label: '米山舞' },
  { value: 'Makoto Shinkai', label: '新海诚' },
  { value: 'Studio Ghibli', label: '吉卜力工作室' },
  { value: 'Hayao Miyazaki', label: '宫崎骏' },
  { value: 'greg rutkowski', label: 'greg rutkowski' },
  { value: 'karol bak', label: 'karol bak' },
  { value: 'Victor Mosquera', label: 'Victor Mosquera' },
  { value: 'Michael James Smith', label: 'Michael James Smith' },
  { value: 'Thomas Kinkade', label: 'Thomas Kinkade' },
  { value: 'krenz cushart', label: 'krenz cushart' },
  { value: 'albert aublet', label: 'albert aublet' },
  { value: 'don bluth', label: 'don bluth' },
  { value: 'ross tran', label: 'ross tran' },
  { value: 'artgerm', label: 'artgerm' },
  { value: 'Caspar David Friedrich', label: 'Caspar David Friedrich' },
  { value: 'WuGuanzhong', label: '吴冠中' },
  { value: 'QiBaishi', label: '齐白石' },
  { value: 'XuBeihong', label: '徐悲鸿' },
  { value: 'TangBohu TangYin', label: '唐伯虎' },
  { value: 'ZhangDaqian', label: '张大千' },
];

const dataTools = [
  { value: 'Unreal Engine', label: '虚幻引擎' },
  { value: 'unity3d', label: 'unity3d' },
  { value: '3d blender render', label: '3d blender' },
  { value: 'Ray tracing', label: '光线追踪' },
  { value: 'RimLight', label: '边缘光' },
  { value: 'reflection', label: '反射光' },
  { value: 'backlit effect', label: '逆光' },
  { value: 'double light effect', label: '双光' },
  { value: 'neon glowing effect', label: '霓虹灯效' },
  { value: 'FilterGrade Light Leaks', label: '漏光特效' },
  { value: 'Tyndall effect', label: '丁达尔光效' },
  { value: 'long exposure', label: '长曝光' },
  { value: 'Vintage Light Leak', label: '舞台灯光' },
  { value: 'dramatic shadows', label: '戏剧化阴影' },
  { value: 'Glowing Smoke effect', label: '烟雾辉光特效' },
  { value: 'CG', label: 'CG' },
  { value: 'Nikon', label: '尼康' },
  { value: 'Sony alpha', label: '索尼alpha' },
  { value: 'Canon', label: '佳能' },
];

const dataOthers = [
  { value: 'masterpiece', label: '杰作' },
  { value: 'best quality', label: '高质量' },
  { value: 'extremely detailed', label: '细节丰富' },
  { value: '8k', label: '8k' },
  { value: '4k', label: '4k' },
  { value: 'High resolution', label: '高分辨率' },
  { value: 'wallpaper', label: '壁纸' },
  { value: 'sharp focus', label: '焦点清晰' },
  { value: 'clear background', label: '干净背景' },
  { value: 'bokeh', label: '背景虚化' },
  { value: 'furry', label: '毛茸茸' },
  { value: 'crystal', label: '水晶' },
  { value: 'fantasy', label: '幻想的' },
  { value: 'epic', label: '史诗的' },
  { value: 'dream', label: '梦幻' },
  { value: 'Artstation', label: '艺术站' },
  { value: 'Behance', label: 'Behance' },
  { value: 'Deviant', label: 'Deviant' },
  { value: 'Pixiv', label: 'P站' },
  { value: 'Danbooru', label: 'Danbooru' },
  { value: 'wombo', label: 'wombo' },
];

const style: React.CSSProperties = { padding: '8px 0' };
const styleLable = { display: 'block', color: '#999', fontSize: '10px' };
const styleButton = { borderRadius: '8px 0px 0px 8px' };

export default function App() {
  const [result, setResult] = useState<string>();
  const [idx, setIdx] = useState<number>(0);
  const db = useIndexedDB('prompt');
  const [form]: [FormInstance] = Form.useForm();

  const [tags, setTags] = useState([]);

  useEffect(() => {
    db.getAll().then((data) => {
      setTags(data);
      console.log(data);
    });
  }, []);

  // 生成prompt
  const onFinish = async (values: any) => {
    console.log('Success:', values);
    let prompt = 'a';
    if (values.dataView) {
      prompt = `${prompt} ${values.dataView}`;
    }
    if (values.dataType1) {
      prompt = `${prompt} ${values.dataType1}`;
    }
    if (values.dataType2) {
      prompt = `${prompt} ${values.dataType2},`;
    }
    if (values.mainPrompt) {
      const url = `${translateUrl}${values.mainPrompt}`;
      try {
        const resp = await axios.get(url);
        console.log(resp);
        const cn_txt = resp?.data.translateResult[0][0].tgt;
        prompt = `${prompt} ${cn_txt},`;
      } catch (e) {
        console.log(e);
        prompt = `${prompt} ${values.mainPrompt},`;
      }
    }
    if (values.dataStyles) {
      prompt = `${prompt} ${values.dataStyles} style,`;
    }
    if (values.dataAuthor) {
      const author = values.dataAuthor.join(', ');
      prompt = `${prompt} by ${author},`;
    }
    if (values.dataColor) {
      const color = values.dataColor.join(', ');
      prompt = `${prompt} ${color} color scheme.`;
    }
    if (values.dataTools) {
      const tools = values.dataTools.join(' ');
      prompt = `${prompt} ${tools}.`;
    }
    if (values.dataOthers) {
      const others = values.dataOthers.join(' ');
      prompt = `${prompt} ${others}.`;
    }
    setResult(prompt);

    console.log('Prompt:', prompt);
  };

  const save = async () => {
    const values = form.getFieldsValue(true);
    console.log(values, idx);
    if (idx == 0) {
      // 新增数据
      const insertRes = await db.add({ name: values.tagName, context: values });
      console.log(insertRes);
      setIdx(insertRes);
    } else {
      // 保存数据
    }
  };

  return (
    <div style={{ padding: 10 }}>
      <Row>
        <Col span={2}></Col>
        <Col span={22}>
          <h1>Prompt生成器</h1>
        </Col>
      </Row>
      <Row>
        <Col span={2} style={{ textAlign: 'right', paddingRight: '8px' }}>
          {tags.map((data) => (
            <Button block style={styleButton} type={idx==data.id?"primary":"default"} >
              {data.name}
            </Button>
          ))}
          <Button type="dashed" style={styleButton} block>
            新增
          </Button>
        </Col>
        <Col span={22}>
          <Form
            name="basic"
            initialValues={{ dataOthers: ['masterpiece', 'best quality'] }}
            onFinish={onFinish}
            autoComplete="off"
            form={form}
          >
            <TextArea placeholder="自动生成的关键词" value={result} rows={10} />
            <Row gutter={8}>
              <Col className="gutter-row" span={4}>
                <div style={style}>
                  <label style={styleLable}>视角</label>
                  <Form.Item name="dataView">
                    <Select
                      style={{ width: '100%' }}
                      options={dataView}
                      allowClear={true}
                    />
                  </Form.Item>
                </div>
              </Col>
              <Col className="gutter-row" span={4}>
                <div style={style}>
                  <label style={styleLable}>主类型</label>
                  <Form.Item name="dataType1">
                    <Select
                      style={{ width: '100%' }}
                      options={dataType1}
                      allowClear={true}
                    />
                  </Form.Item>
                </div>
              </Col>
              <Col className="gutter-row" span={4}>
                <div style={style}>
                  <label style={styleLable}>子类型</label>
                  <Form.Item name="dataType2">
                    <Select
                      style={{ width: '100%' }}
                      options={dataType2}
                      allowClear={true}
                    />
                  </Form.Item>
                </div>
              </Col>
              <Col className="gutter-row" span={4}>
                <div style={style}>
                  <label style={styleLable}>风格</label>
                  <Form.Item name="dataStyles">
                    <Select
                      style={{ width: '100%' }}
                      options={dataStyles}
                      allowClear={true}
                    />
                  </Form.Item>
                </div>
              </Col>
              <Col className="gutter-row" span={8}>
                <div style={style}>
                  <label style={styleLable}>作家</label>
                  <Form.Item name="dataAuthor">
                    <Select
                      mode="multiple"
                      style={{ width: '100%' }}
                      options={dataAuthor}
                      allowClear={true}
                    />
                  </Form.Item>
                </div>
              </Col>
              <Col className="gutter-row" span={8}>
                <div style={style}>
                  <label style={styleLable}>色彩</label>
                  <Form.Item name="dataColor">
                    <Select
                      style={{ width: '100%' }}
                      options={dataColor}
                      showSearch
                      mode="multiple"
                      optionFilterProp="children"
                      onChange={onChange}
                      onSearch={onSearch}
                      filterOption={(input: any, option: any) =>
                        (option?.label ?? '')
                          .toLowerCase()
                          .includes(input.toLowerCase())
                      }
                      allowClear={true}
                    />
                  </Form.Item>
                </div>
              </Col>
              <Col className="gutter-row" span={8}>
                <div style={style}>
                  <label style={styleLable}>光效/渲染/工具</label>
                  <Form.Item name="dataTools">
                    <Select
                      mode="multiple"
                      style={{ width: '100%' }}
                      options={dataTools}
                      allowClear={true}
                    />
                  </Form.Item>
                </div>
              </Col>
              <Col className="gutter-row" span={8}>
                <div style={style}>
                  <label style={styleLable}>其他细节</label>
                  <Form.Item name="dataOthers">
                    <Select
                      mode="multiple"
                      style={{ width: '100%' }}
                      options={dataOthers}
                      allowClear={true}
                    />
                  </Form.Item>
                </div>
              </Col>
              <Col className="gutter-row" span={16}>
                <div style={style}>
                  <label style={styleLable}>* 作品主题/内容/场景</label>
                  <Form.Item
                    name="mainPrompt"
                    rules={[
                      {
                        required: true,
                        message: '必须要填入作品主题/内容/场景',
                      },
                    ]}
                  >
                    <TextArea placeholder="请在此输入" size="large" rows={4} />
                  </Form.Item>
                </div>
              </Col>
              <Col className="gutter-row" span={8}>
                <div style={style}>
                  <label style={styleLable}>&nbsp;</label>
                  <Form.Item style={{ marginBottom: '8px' }}>
                    <Button
                      size="large"
                      type="primary"
                      htmlType="submit"
                      style={{ width: '100%' }}
                    >
                      翻译&生成
                    </Button>
                  </Form.Item>

                  <Input.Group compact style={{ width: '100%' }}>
                    <Form.Item name="tagName" noStyle>
                      <Input
                        style={{ width: 'calc(100% - 60px)' }}
                        defaultValue="新标签"
                      />
                    </Form.Item>
                    <Button
                      type="default"
                      htmlType="button"
                      style={{ width: '60px' }}
                      onClick={save}
                    >
                      保存
                    </Button>
                  </Input.Group>
                </div>
              </Col>
            </Row>
          </Form>
          <Divider />
          <p style={{ color: '#999', fontSize: '12px', fontFamily: 'Courier' }}>
            Author by zuojianghua :)
          </p>
        </Col>
      </Row>
    </div>
  );
}
