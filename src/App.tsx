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
  message,
  Popconfirm,
  Card,
} from 'antd';
import { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { initDB, useIndexedDB } from 'react-indexed-db';

// 翻译接口/本地离线数据初始化配置
import { DBConfig, translateUrl } from './config';
// 各类提示tag
import {
  dataView,
  dataType1,
  dataType2,
  dataColor,
  dataStyles,
  dataAuthor,
  dataTools,
  dataOthers,
} from './prompt';

const { Title, Paragraph, Text, Link } = Typography;
const { TextArea } = Input;

try {
  initDB(DBConfig);
} catch (e) {}

const style: React.CSSProperties = { padding: '8px 0' };
const styleLable = { display: 'block', color: '#999', fontSize: '10px' };
const styleButton = { borderRadius: '8px 0px 0px 8px', borderRight: 'none' };

export default function App() {
  // 初始化
  const [result, setResult] = useState<string>('');
  const [idx, setIdx] = useState<number>(0);
  const db = useIndexedDB('prompt');
  const [form]: [FormInstance] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();
  const [tags, setTags] = useState([]);

  // 刷新左侧tag清单
  const refreshTagData = () =>
    db.getAll().then((data:any) => {
      setTags(data);
      console.log(data);
    });

  useEffect(() => {
    refreshTagData();
  }, []);

  // 组合生成prompt
  const onFinish = async (values: any) => {
    // console.log('Success:', values);
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
        // 翻译为英文
        const resp = await axios.get(url);
        // console.log(resp);
        const cn_txt = resp?.data.translateResult[0][0].tgt;
        prompt = `${prompt} ${cn_txt},`;
      } catch (e) {
        // 翻译失败直接使用中文
        // console.log(e);
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
    // console.log('Prompt:', prompt);
  };

  // 新增一个空白标签
  const addNewTag = () => {
    setIdx(0);
    form.resetFields();
  };

  // 保存一组预设标签
  const save = async () => {
    const values = form.getFieldsValue(true);
    if (values.tagName == '' || !values.tagName) {
      alert('保存时请输入标签名');
      return;
    }
    // console.log(values, idx);
    try {
      if (idx == 0) {
        // 新增数据
        const insertRes = await db.add({
          name: values.tagName,
          context: values,
        });
        console.log(insertRes);
        setIdx(insertRes);
        messageApi.success('新增成功');
      } else {
        // 保存数据
        await db.update({ name: values.tagName, context: values, id: idx });
        messageApi.success('保存成功');
      }
    } catch (e) {
      messageApi.error('保存失败');
    }
    // 保存后刷新标签列表
    refreshTagData();
  };

  // 获取其中一个预设标签
  const getTags = async (id:number) => {
    setIdx(id);
    const dataInfo = await db.getByID(id);
    // console.log(dataInfo);
    form.resetFields();
    form.setFieldsValue(dataInfo.context);
  };

  // 删除其中一个预设标签
  const delTags = async () => {
    try {
      if (idx != 0) await db.deleteRecord(idx);
      setIdx(0);
      messageApi.success('删除成功');
      refreshTagData();
    } catch (e) {
      messageApi.error('删除失败');
    } finally {
      form.resetFields();
    }
  };

  return (
    <div style={{ padding: 10 }}>
      {contextHolder}
      <Row>
        <Col span={2}></Col>
        <Col span={22}>
          <h1>
            <span style={{ fontSize: '1.5em' }}>P</span>rompt生成器
          </h1>
        </Col>
      </Row>
      <Row>
        <Col
          span={2}
          style={{
            textAlign: 'right',
            marginRight: '0px',
            borderRight: '1px solid #eee',
          }}
        >
          {tags.map((data:any) => (
            <Button
              key={data.id}
              block
              style={styleButton}
              type={idx == data.id ? 'primary' : 'default'}
              onClick={() => getTags(data.id)}
            >
              {data.name}
            </Button>
          ))}
          <Button type="dashed" style={styleButton} block onClick={addNewTag}>
            新增
          </Button>
        </Col>
        <Col span={22} style={{ paddingLeft: '8px' }}>
          <Form
            name="basic"
            initialValues={{ dataOthers: ['masterpiece', 'best quality'] }}
            onFinish={onFinish}
            autoComplete="off"
            form={form}
          >
            <Card>
              <Paragraph
                editable={result?.length != 0}
                copyable={result?.length != 0}
              >
                {result}
              </Paragraph>
            </Card>
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
              <Col className="gutter-row" span={20}>
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
              <Col className="gutter-row" span={4}>
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
                        style={{ width: 'calc(100% - 90px)' }}
                        defaultValue="新标签"
                        placeholder="标签名"
                      />
                    </Form.Item>
                    <Button
                      type="default"
                      htmlType="button"
                      style={{ width: '45px' }}
                      onClick={save}
                    >
                      存
                    </Button>
                    <Popconfirm
                      placement="leftBottom"
                      title="确认删除?"
                      onConfirm={delTags}
                      okText="Yes"
                      cancelText="No"
                    >
                      <Button
                        type="dashed"
                        htmlType="button"
                        style={{ width: '45px' }}
                      >
                        删
                      </Button>
                    </Popconfirm>
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
