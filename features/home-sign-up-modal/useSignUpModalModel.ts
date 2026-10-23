"use client";
import type { Feedback, FormController } from "@/types/presentation";

import { SignUpModalProps } from "@/features/home-sign-up-modal/types";
import { authAPI } from "@/lib/api";
import React, { useEffect, useState } from "react";

const phonePrefix = "+82";

export function useSignUpModalModel(
  { open, onClose, isEarlybird = false }: SignUpModalProps,
  { message, form }: { message: Feedback; form: FormController },
) {
  const [step, setStep] = useState(0);

  const [loading, setLoading] = useState(false);

  const [email, setEmail] = useState("");

  const [userInfo, setUserInfo] = useState({
    name: "",
    password: "",
    phoneNumber: "",
    nickname: "",
  });

  const [agreements, setAgreements] = useState({
    all: true,
    age: true,
    terms: true,
    privacy: true,
    marketing: true,
    marketingMobile: true,
    marketingEmail: true,
  });

  const [otherPlatform, setOtherPlatform] = useState("");

  const [verificationTimer, setVerificationTimer] = useState(0);

  const [isVerificationTimerRunning, setIsVerificationTimerRunning] =
    useState(false);

  const [isCheckingEmail, setIsCheckingEmail] = useState(false);

  const [isEmailExists, setIsEmailExists] = useState(false);

  const [emailError, setEmailError] = useState<string>("");

  // 약관 개별동의 핸들러
  const handleAgreementChange = (key: string, checked: boolean) => {
    if (key === "marketing") {
      // 마케팅 약관 동의 시 하위 약관 일괄 처리
      setAgreements((prev) => ({
        ...prev,
        marketing: checked,
        marketingMobile: checked,
        marketingEmail: checked,
      }));
      return;
    }

    if (key === "marketingMobile" || key === "marketingEmail") {
      // 하위 약관 체크/해제 시 마케팅 약관 상태 업데이트
      setAgreements((prev) => {
        const next = { ...prev, [key]: checked };
        // 하나라도 체크되어 있으면 마케팅 약관 체크
        next.marketing = next.marketingMobile || next.marketingEmail;
        return next;
      });
      return;
    }

    // 기타 약관 처리
    setAgreements((prev) => {
      const next = { ...prev, [key]: checked };
      next.all =
        next.age &&
        next.terms &&
        next.privacy &&
        next.marketing &&
        next.marketingMobile &&
        next.marketingEmail;
      return next;
    });
  };

  // 약관 전체동의 핸들러
  const handleAllAgree = (checked: boolean) => {
    setAgreements({
      all: checked,
      age: checked,
      terms: checked,
      privacy: checked,
      marketing: checked,
      marketingMobile: checked,
      marketingEmail: checked,
    });
  };

  // 모든 약관 동의 상태를 실시간으로 계산
  useEffect(() => {
    const allChecked =
      agreements.age &&
      agreements.terms &&
      agreements.privacy &&
      agreements.marketing &&
      agreements.marketingMobile &&
      agreements.marketingEmail;
    if (agreements.all !== allChecked) {
      setAgreements((prev) => ({ ...prev, all: allChecked }));
    }
    // eslint-disable-next-line
  }, [
    agreements.age,
    agreements.terms,
    agreements.privacy,
    agreements.marketing,
    agreements.marketingMobile,
    agreements.marketingEmail,
  ]);

  // 이메일 형식 검증
  const validateEmail = (email: string) => {
    if (!email) {
      setEmailError("이메일을 입력해주세요.");
      return false;
    }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      setEmailError("올바른 이메일 형식이 아닙니다.");
      return false;
    }
    return true;
  };

  // 이메일 중복 체크 함수 (얼리버드 체크 포함)
  const checkEmailExists = async (email: string) => {
    if (!validateEmail(email)) return true;

    try {
      setIsCheckingEmail(true);
      setEmailError("");

      const response = await authAPI.checkEmail(email);
      if (response.data.exists) {
        setEmailError("이미 사용 중인 이메일입니다.");
        setIsEmailExists(true);
        return true;
      }
      setEmailError("사용 가능한 이메일입니다.");
      setIsEmailExists(false);
      return false;
    } catch (error) {
      setEmailError("이메일 확인 중 오류가 발생했습니다.");
      setIsEmailExists(true);
      return true;
    } finally {
      setIsCheckingEmail(false);
    }
  };

  // 이메일 입력 필드의 onBlur 이벤트 핸들러
  const handleEmailBlur = async (e: React.FocusEvent<HTMLInputElement>) => {
    const email = e.target.value;
    if (email) {
      await checkEmailExists(email);
    }
  };

  // 이메일 입력 단계 → 다음
  const handleEmailNext = async () => {
    if (!validateEmail(email)) {
      return;
    }
    // 이메일 중복 체크 실행
    const exists = await checkEmailExists(email);
    if (exists) {
      return;
    }
    setStep(1);
  };

  // 정보입력 단계 → 다음
  const handleInfoNext = async () => {
    try {
      const values = await form.validateFields();
      setUserInfo({
        name: values.name,
        password: values.password,
        phoneNumber: values.phoneNumber,
        nickname: values.nickname,
      });
      setStep(2);
    } catch (e) {
      // validation error
    }
  };

  // 약관동의 단계 → 가입
  const handleSignUp = async () => {
    if (!agreements.age || !agreements.terms || !agreements.privacy) {
      message.error("필수 약관에 동의해주세요.");
      return;
    }
    setLoading(true);
    try {
      // 회원가입 (얼리버드 플래그 포함)
      await authAPI.signup({
        email,
        password: userInfo.password,
        name: userInfo.name,
        nickname: userInfo.nickname,
        phoneNumber: phonePrefix + userInfo.phoneNumber,
        isEarlybird,
      });

      setStep(3);
      message.success("회원가입이 완료되었습니다! 이메일을 확인해주세요.");
    } catch (err: any) {
      message.error(
        err?.response?.data?.message || "회원가입 중 오류가 발생했습니다.",
      );
    } finally {
      setLoading(false);
    }
  };

  // 모달 닫기 시 상태 초기화
  const handleClose = () => {
    setStep(0);
    setEmail("");
    setIsEmailExists(false);
    setEmailError("");
    setUserInfo({ name: "", password: "", phoneNumber: "", nickname: "" });
    setAgreements({
      all: false,
      age: false,
      terms: false,
      privacy: false,
      marketing: false,
      marketingMobile: true,
      marketingEmail: true,
    });
    onClose();
  };

  return {
    step,
    setStep,
    loading,
    form,
    email,
    setEmail,
    agreements,
    isCheckingEmail,
    emailError,
    setEmailError,
    handleAgreementChange,
    handleAllAgree,
    validateEmail,
    handleEmailBlur,
    handleEmailNext,
    handleInfoNext,
    handleSignUp,
    handleClose,
  };
}
