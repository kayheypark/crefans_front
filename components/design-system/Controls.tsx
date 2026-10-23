"use client";

import { useState } from "react";
import {
  App,
  AutoComplete,
  Button,
  Cascader,
  Checkbox,
  ColorPicker,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Radio,
  Rate,
  Select,
  Slider,
  Space,
  Switch,
  TimePicker,
  TreeSelect,
  Upload,
} from "antd";
import {
  ArrowRightOutlined,
  BellOutlined,
  CheckOutlined,
  CloseOutlined,
  DeleteOutlined,
  EditOutlined,
  HeartOutlined,
  LoadingOutlined,
  LockOutlined,
  MailOutlined,
  PlusOutlined,
  SearchOutlined,
  SettingOutlined,
  UploadOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { CatalogSection, Specimen } from "./Primitives";
import styles from "./design-system.module.css";

export function ActionsSection({ disabled }: { disabled: boolean }) {
  const { message } = App.useApp();
  const [busy, setBusy] = useState(false);
  return (
    <CatalogSection
      id="actions"
      number="03"
      title="버튼과 아이콘"
      description="행동의 중요도, 크기와 상태를 비교합니다. Hover·Pressed는 포인터로, Focus는 Tab 키로 확인하세요."
    >
      <div className={styles.grid}>
        <Specimen
          title="버튼 종류"
          spec="type: primary / default / dashed / text / link"
        >
          <Space wrap>
            <Button
              type="primary"
              disabled={disabled}
              onClick={() => message.success("기본 행동이 실행되었습니다.")}
            >
              주요 행동
            </Button>
            <Button disabled={disabled}>보조 행동</Button>
            <Button type="dashed" icon={<PlusOutlined />} disabled={disabled}>
              추가
            </Button>
            <Button type="text" disabled={disabled}>
              텍스트
            </Button>
            <Button type="link" disabled={disabled}>
              링크
            </Button>
          </Space>
        </Specimen>
        <Specimen
          title="아이콘·위험 행동·전체 너비"
          spec="icon · danger · shape · block"
        >
          <div className={styles.stack}>
            <Space wrap>
              <Button icon={<EditOutlined />} disabled={disabled}>
                편집
              </Button>
              <Button danger icon={<DeleteOutlined />} disabled={disabled}>
                삭제
              </Button>
              <Button type="primary" danger disabled={disabled}>
                영구 삭제
              </Button>
              <Button
                shape="circle"
                icon={<HeartOutlined />}
                aria-label="좋아요 예시"
                disabled={disabled}
              />
            </Space>
            <Button
              type="primary"
              block
              icon={<ArrowRightOutlined />}
              disabled={disabled}
            >
              다음으로
            </Button>
          </div>
        </Specimen>
        <Specimen
          title="크기와 로딩"
          spec="size: small / middle / large · loading"
        >
          <Space wrap align="center">
            <Button size="small" disabled={disabled}>
              Small
            </Button>
            <Button size="middle" disabled={disabled}>
              Middle
            </Button>
            <Button size="large" disabled={disabled}>
              Large
            </Button>
            <Button type="primary" loading disabled={disabled}>
              저장 중
            </Button>
            <Button
              loading={busy}
              disabled={disabled}
              onClick={() => {
                setBusy(true);
                setTimeout(() => setBusy(false), 1200);
              }}
            >
              로딩 실행
            </Button>
          </Space>
        </Specimen>
        <Specimen title="Disabled / Ghost" spec="disabled · ghost">
          <div className={styles.stack}>
            <Space wrap>
              <Button type="primary" disabled>
                주요 행동
              </Button>
              <Button disabled>보조 행동</Button>
              <Button danger disabled>
                삭제
              </Button>
              <Button type="link" disabled>
                링크
              </Button>
            </Space>
            <div
              style={{ background: "#22324b", padding: 16, borderRadius: 6 }}
            >
              <Space>
                <Button ghost disabled={disabled}>
                  Ghost
                </Button>
                <Button type="primary" ghost disabled={disabled}>
                  Primary ghost
                </Button>
                <Button ghost disabled>
                  Disabled
                </Button>
              </Space>
            </div>
          </div>
        </Specimen>
        <Specimen
          title="아이콘 규격"
          spec="Ant Design Icons · 16 / 20 / 24px"
          wide
        >
          <div className={styles.row}>
            {[
              { icon: <UserOutlined />, name: "user" },
              { icon: <HeartOutlined />, name: "heart" },
              { icon: <BellOutlined />, name: "bell" },
              { icon: <SearchOutlined />, name: "search" },
              { icon: <PlusOutlined />, name: "plus" },
              { icon: <CheckOutlined />, name: "check" },
              { icon: <CloseOutlined />, name: "close" },
              { icon: <SettingOutlined />, name: "settings" },
              { icon: <LoadingOutlined />, name: "loading" },
            ].map((item) => (
              <div key={item.name} className={styles.iconCell}>
                <span style={{ fontSize: 20 }}>{item.icon}</span>
                <span>{item.name}</span>
              </div>
            ))}
          </div>
          <p className={styles.note}>
            아이콘 단독 버튼에는 접근 가능한 이름을 지정합니다. 아이콘은 주변
            텍스트와 함께 의미를 전달합니다.
          </p>
        </Specimen>
      </div>
    </CatalogSection>
  );
}

export function InputsSection({ disabled }: { disabled: boolean }) {
  const options = [
    { value: "illustration", label: "일러스트" },
    { value: "music", label: "음악" },
    { value: "life", label: "라이프" },
    { value: "unavailable", label: "선택 불가", disabled: true },
  ];
  return (
    <CatalogSection
      id="inputs"
      number="04"
      title="입력과 선택"
      description="직접 입력·검색·선택해 볼 수 있습니다. 상단의 크기와 비활성 전환은 이 영역에도 적용됩니다."
    >
      <div className={styles.grid}>
        <Specimen
          title="텍스트 입력"
          spec="Input · prefix / suffix / allowClear / readOnly"
        >
          <div className={styles.stack}>
            <Input
              aria-label="기본 텍스트 입력"
              placeholder="이름을 입력해 주세요"
              disabled={disabled}
              allowClear
            />
            <Input
              aria-label="이메일 입력 예시"
              prefix={<MailOutlined />}
              placeholder="name@example.com"
              disabled={disabled}
            />
            <Input
              aria-label="웹 주소 입력"
              addonBefore="https://"
              addonAfter=".crefans.com"
              placeholder="studio"
              disabled={disabled}
            />
            <Input
              aria-label="읽기전용 예시"
              value="읽기전용 값입니다"
              readOnly
            />
          </div>
        </Specimen>
        <Specimen
          title="비밀번호·검색·숫자"
          spec="Input.Password / Search · InputNumber"
        >
          <div className={styles.stack}>
            <Input.Password
              aria-label="비밀번호 예시"
              prefix={<LockOutlined />}
              placeholder="비밀번호"
              disabled={disabled}
            />
            <Input.Search
              aria-label="검색어 예시"
              placeholder="크리에이터 검색"
              enterButton
              disabled={disabled}
            />
            <InputNumber
              aria-label="월 구독료 예시"
              addonBefore="₩"
              min={0}
              step={1000}
              defaultValue={9900}
              disabled={disabled}
              style={{ width: "100%" }}
            />
          </div>
        </Specimen>
        <Specimen
          title="멀티라인·자동완성"
          spec="Input.TextArea · showCount / maxLength · AutoComplete"
        >
          <div className={styles.stack}>
            <Input.TextArea
              aria-label="소개글 입력 예시"
              placeholder="크리에이터 소개를 작성해 주세요"
              rows={3}
              maxLength={120}
              showCount
              disabled={disabled}
            />
            <AutoComplete
              aria-label="이메일 자동완성 예시"
              options={[
                { value: "hello@example.com" },
                { value: "studio@example.com" },
              ]}
              placeholder="이메일 자동완성"
              disabled={disabled}
              style={{ width: "100%", marginTop: 8 }}
            />
          </div>
        </Specimen>
        <Specimen
          title="셀렉트박스"
          spec="Select · single / multiple / searchable / loading"
        >
          <div className={styles.stack}>
            <Select
              aria-label="카테고리 선택 예시"
              options={options}
              placeholder="카테고리 선택"
              disabled={disabled}
              allowClear
            />
            <Select
              aria-label="다중 카테고리 예시"
              mode="multiple"
              options={options}
              defaultValue={["illustration", "music"]}
              disabled={disabled}
            />
            <Select
              aria-label="검색 가능한 선택 예시"
              showSearch
              optionFilterProp="label"
              options={options}
              placeholder="이름으로 검색"
              disabled={disabled}
            />
            <Select
              aria-label="로딩 중인 선택 예시"
              loading
              placeholder="목록을 불러오는 중"
              disabled={disabled}
            />
          </div>
        </Specimen>
        <Specimen
          title="체크박스·라디오·스위치"
          spec="Checkbox · Radio.Group · Switch"
        >
          <div className={styles.stack}>
            <Space wrap>
              <Checkbox defaultChecked disabled={disabled}>
                선택됨
              </Checkbox>
              <Checkbox disabled={disabled}>기본</Checkbox>
              <Checkbox indeterminate disabled={disabled}>
                부분 선택
              </Checkbox>
              <Checkbox disabled>비활성</Checkbox>
            </Space>
            <Radio.Group defaultValue="month" disabled={disabled}>
              <Radio value="month">매월</Radio>
              <Radio value="year">매년</Radio>
              <Radio value="off" disabled>
                선택 불가
              </Radio>
            </Radio.Group>
            <Space>
              <Switch
                defaultChecked
                checkedChildren="ON"
                unCheckedChildren="OFF"
                disabled={disabled}
                aria-label="기본 스위치"
              />
              <Switch disabled aria-label="비활성 스위치" />
              <Switch loading defaultChecked aria-label="로딩 스위치" />
            </Space>
          </div>
        </Specimen>
        <Specimen
          title="날짜·시간·기간"
          spec="DatePicker · RangePicker · TimePicker"
        >
          <div className={styles.stack}>
            <DatePicker
              aria-label="날짜 선택"
              placeholder="날짜 선택"
              disabled={disabled}
              style={{ width: "100%" }}
            />
            <DatePicker.RangePicker
              placeholder={["시작일", "종료일"]}
              disabled={disabled}
              style={{ width: "100%" }}
            />
            <TimePicker
              aria-label="시간 선택"
              placeholder="시간 선택"
              disabled={disabled}
              style={{ width: "100%" }}
            />
          </div>
        </Specimen>
        <Specimen title="범위·평점·색상" spec="Slider · Rate · ColorPicker">
          <div className={styles.stack}>
            <Slider
              aria-label="범위 예시"
              range
              defaultValue={[20, 70]}
              disabled={disabled}
            />
            <Rate defaultValue={3.5} allowHalf disabled={disabled} />
            <Space>
              <ColorPicker
                defaultValue="#1890ff"
                showText
                disabled={disabled}
              />
              <span className={styles.note}>미리보기 색상 선택</span>
            </Space>
          </div>
        </Specimen>
        <Specimen
          title="계층 선택·파일 업로드"
          spec="Cascader · TreeSelect · Upload (local only)"
        >
          <div className={styles.stack}>
            <Cascader
              aria-label="분류 경로 선택"
              options={[
                {
                  value: "art",
                  label: "아트",
                  children: [
                    { value: "drawing", label: "드로잉" },
                    { value: "photo", label: "사진" },
                  ],
                },
              ]}
              placeholder="분류 선택"
              disabled={disabled}
            />
            <TreeSelect
              aria-label="트리 선택"
              treeData={[
                {
                  value: "content",
                  title: "콘텐츠",
                  children: [
                    { value: "video", title: "영상" },
                    { value: "image", title: "이미지" },
                  ],
                },
              ]}
              placeholder="콘텐츠 선택"
              disabled={disabled}
            />
            <Upload beforeUpload={() => false} maxCount={2} disabled={disabled}>
              <Button icon={<UploadOutlined />} disabled={disabled}>
                파일 선택
              </Button>
            </Upload>
            <p className={styles.note}>
              선택한 파일은 예시 목록에만 표시되며 서버로 전송되지 않습니다.
            </p>
          </div>
        </Specimen>
      </div>
    </CatalogSection>
  );
}

export function ValidationSection({ disabled }: { disabled: boolean }) {
  const { message } = App.useApp();
  const [demoForm] = Form.useForm();
  return (
    <CatalogSection
      id="validation"
      number="05"
      title="폼과 오류 메시지"
      description="기본 도움말과 오류·경고·성공 메시지를 비교하고, 실제 검증 흐름을 실행합니다."
    >
      <div className={styles.grid}>
        <Specimen
          title="필드 상태와 도움말"
          spec="Form.Item · help / validateStatus / hasFeedback"
        >
          <Form layout="vertical" disabled={disabled}>
            <Form.Item
              label="이메일 · 기본"
              help="안내를 받을 이메일을 입력해 주세요."
            >
              <Input
                aria-label="기본 이메일 필드"
                placeholder="name@example.com"
              />
            </Form.Item>
            <Form.Item
              label="이메일 · 오류"
              validateStatus="error"
              help="올바른 이메일 형식으로 입력해 주세요."
              hasFeedback
            >
              <Input
                aria-label="오류 이메일 필드"
                aria-invalid="true"
                defaultValue="hello@"
              />
            </Form.Item>
            <Form.Item
              label="핸들 · 경고"
              validateStatus="warning"
              help="핸들을 변경하면 기존 프로필 주소가 바뀝니다."
              hasFeedback
            >
              <Input aria-label="경고 핸들 필드" defaultValue="my-studio" />
            </Form.Item>
            <Form.Item
              label="닉네임 · 성공"
              validateStatus="success"
              help="사용할 수 있는 닉네임입니다."
              hasFeedback
            >
              <Input
                aria-label="성공 닉네임 필드"
                defaultValue="소연의 스튜디오"
              />
            </Form.Item>
            <Form.Item
              label="중복 확인 중"
              validateStatus="validating"
              help="입력한 정보를 확인하고 있습니다."
              hasFeedback
            >
              <Input aria-label="검증 중인 필드" defaultValue="studio" />
            </Form.Item>
          </Form>
        </Specimen>
        <Specimen
          title="실제 검증과 제출"
          spec="required · email · min length · disabled submit"
        >
          <Form
            name="design-system-demo"
            form={demoForm}
            layout="vertical"
            disabled={disabled}
            onFinish={() =>
              message.success(
                "검증을 통과했습니다. 데이터는 저장하지 않습니다.",
              )
            }
          >
            <Form.Item
              name="name"
              label="닉네임"
              rules={[
                { required: true, message: "닉네임을 입력해 주세요." },
                { min: 2, message: "닉네임은 2자 이상 입력해 주세요." },
              ]}
            >
              <Input placeholder="2자 이상 입력" />
            </Form.Item>
            <Form.Item
              name="email"
              label="이메일"
              rules={[
                { required: true, message: "이메일을 입력해 주세요." },
                {
                  type: "email",
                  message: "올바른 이메일 주소를 입력해 주세요.",
                },
              ]}
            >
              <Input placeholder="name@example.com" />
            </Form.Item>
            <Form.Item
              name="category"
              label="카테고리"
              rules={[{ required: true, message: "카테고리를 선택해 주세요." }]}
            >
              <Select
                placeholder="선택해 주세요"
                options={[
                  { value: "art", label: "아트" },
                  { value: "music", label: "음악" },
                ]}
              />
            </Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                검증 실행
              </Button>
              <Button onClick={() => demoForm.resetFields()}>초기화</Button>
            </Space>
            <p className={styles.note}>
              빈 상태로 제출하면 필드 아래에 오류가 나타납니다. 오류를 고치면
              제출 성공 스낵바를 확인할 수 있습니다.
            </p>
          </Form>
        </Specimen>
      </div>
    </CatalogSection>
  );
}
