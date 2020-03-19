# 스프링 시큐리티와 OAuth 2.0으로 로그인 기능 구현하기

스프링 시큐리티(Spring Security)는 막강한 인증과 인과(혹인 권한 부여) 기능을 가진 프레임워크입니다.
사실상 스프링 기반의 애플리케이션에서는 보안을 위한 표준이라고 보면 됩니다. 필터 기반의 보안 기능을 구현하는 것보다 스프링 시큐리티를 통해 구현하는 것을 적극적으로 권하고 있습니다.

## 1. 스프링 시큐리티와 스프링 시큐리티 Oauth2 클라이언트

#### OAuth
하지만 오픈 아이디는 표준스펙이 존재하지 않았기 때문에 제공자마다 서로 다른 프로토콜을 제공하여 여러 오픈 아이디를 제공하기 위해선 각 규격별로 연동을 만들어야 했고, 일부 프로토콜에선 보안 이슈가 많이 나오기도 했습니다.

때문에 표준적인 방법을 고려하던 사람들은 OAuth 라는 규격을 만들고 2007년 10월 03일 OAuth 1.0 을 발표하게 되었습니다.

https://oauth.net/
2016년 OAuth 의 최신버전은 2.0이며 대부분의 소셜과 국내 대형 포털들은 해당 스펙에 맞게 로그인을 제공해 주고있습니다.

OAuth2 를 제공하는 서비스
페이스북, 깃허브, 트위터, 네이버, 카카오등...
(그밖에도 많이 있지만 필자도 찾아봐야지 압니다.... 일반적으로 로그인 API를 지원한다라고 말하면 OAuth2 지원이라고 봐도 무방합니다.)

#### 스프링 부트 1.5 vs 스프링 부트 2.0
스프링 부트 1.5.에서의 OAuth2 연동 방법이 2.0에서는 크게 변경되었습니다. 하지만 **설정 방법에 크게 차이가 없는 경우를 자주 봅니다.** 이는 spring-security-oauth2-autoconfigure 라이브러리 덕입니다.
```
spring-security-oauth2-autoconfigure 
```
spring-security-oauth2-autoconfigure 라이브러리를 사용할 경우 스프링 부트 2에서도 1.5에서 쓰던 설정을 그대로 사용할 수 있습니다.

하지만 이 책에서는 스프링 부트 2 방식인 Spring Security Oatuh2 Clinet 라이브러리를 사용해서 진행합니다. 이유는 다음과 같습니다.
 - 스프링 팀에서 기존 1.5에서 사용되던 spring-security-oauth 프로젝트는 유지 상태로 결정했으며 더는 신규 기능은 추가하지 않고 버그 수정 정도의 기능만 추가될 예정이라고 선언함
 - 스프링 부트용 라이브러리 출시
 - 기존에 사용되던 방식은 확장 포인트가 적절하게 오픈되어 있지 않아 직접 상속하거나 오버라딩 해야 하고 신규 라이브러리의 경우 확장 포인트를 고려해서 설계된 상태

## 2. 구글 서비스 등록
먼저 구글 서비스에 신규 서비스를 생성합니다. 여기서 발급된 인증 정보(clientId와 clientSecret)를 통해서 로그인 기능과 소셜 서비스 기능을 사용 할 수 있으니 무조건 발급 받고 시작해야 합니다.

구글 클라우드 플랫폼 주소([Google Cloud Platform](https://console.cloud.google.com))로 이동합니다.

> ```프로젝트 생성```
>
> <img src="../../images/spring/chater05/google1.png" width="80%" height="70%" title="OAuth" alt="OAuth"></img><br/>
> ```API 및 서비스 대시보드 이동```
>
> ```사용자 인증 정보 > 사용자 인증 정보 만들기 ```
>
> <img src="../../images/spring/chater05/google2.png" width="80%" height="70%" title="OAuth" alt="OAuth"></img><br/>
> ```OAuth 클라이언트 ID 만들기 > 동의 화면 구성 버튼 클릭```
>
> <img src="../../images/spring/chater05/google3.png" width="80%" height="70%" title="OAuth" alt="OAuth"></img><br/>
> ```OAuth 동의 화면 입력```
>
> <img src="../../images/spring/chater05/google4.png" width="80%" height="70%" title="OAuth" alt="OAuth"></img><br/>

- **애플리케이션 이름** : 구글 로그인 시 사용자에게 노출될 애플리케이션 이름을 이야기 합니다.
- **지원 이메일** : 사용자 동의 화면에서 노출될 이메일 주소입니다. 보통은 서비스의 help 이메일 주소를 사용하지만, 여기서는 독자의 이메일 주소를 사용해주시면 됩니다.
- **Google API의 범위** : 이번에 등록할 구글 서비스에서 사용할 범위 목록입니다. 기본값은 email/profile/poenid이며, 여기서는 딱 기본 범위만 사용합니다. 이외 다른 정보들도 사용하고 싶다면 범위 추가 버튼으로 추가하면 됩니다.

> ```OAuth 클라이언트 ID 만들기```
>
> <img src="../../images/spring/chater05/google5.png" width="80%" height="70%" title="OAuth" alt="OAuth"></img><br/>
> ```승인된 리디렉션 URL```
>
> <img src="../../images/spring/chater05/google6.png" width="80%" height="70%" title="OAuth" alt="OAuth"></img><br/>

- 서비스에서 파라미터로 인증 정보를 주었을 때 인증시 성공하면 구글에서 리다이렉트할 URL입니다.
- 스프링 부트 2 버전의 시큐리티에서는 기본적으로 {도메인}/login/oauth2/code/{소셜서비스코드}로 리다이렉트 URL을 지원하고 있습니다.
- 사용자가 별도로 리다이렉트 URL을 지원하는 Controller를 만들 피료가 없습니다. 시큐리티에서 이미 구현해 놓은 상태입니다.
- 현재는 개발 단계이므로 http://localhost:8080/login/oauth2/code/google로만 등록합니다.
- AWS 서버에 배포하게 되면 localhost 외에 추가로 주소를 추가해야하며, 이건 이후 단계에서 진행하겠습니다.

#### 클라이언트 ID와 클라이언트 보안 비밀코드를 프로젝트에 설정

- **application-oauth.properties 등록**

> ```application-oauth.properties```
>
> <img src="../../images/spring/chater05/google7.png" width="50%" height="70%" title="OAuth" alt="OAuth"></img><br/>
> ```
>spring.security.oauth2.client.registration.google.client-id=클라이언트 ID
>spring.security.oauth2.client.registration.google.client-secret=클라이언트 보안 비밀번호
>spring.security.oauth2.client.registration.google.scope=profile,email
> ```

- **scope=profile,email**
    - 많은 예제에서는 이 scope를 별도로 등록하지 않고 있습니다.
    - 기본값이 openid,profile,email이기 때문입니다.
    - 강제로 profile,email를 등록한 이유는 openid라는 scope가 있으면 Open id Provider로 인식하기 때문입니다.
    - 이렇게 되면 Open id Provider인 서비스(구글)와 그렇지 않은 서비스(네이버/카카오 등)로 나눠서 각각 OAuth2Service를 만들어야 합니다.
    - 하나의 OAuth2Service로 사용하기 위해 일부러 openid scope를 빼고 등록합니다.

- **application.properties 추가 **
> ```
>spring.profiles.include=oauth
> ```    

- **.gitignore 등록**
> ```
> application-oauth.properties
> ```

보안을 위해 깃허브에 application-oauth.properties 파일이 올라가는 것을 방지하겠습니다.
추가한 뒤 커밋했을 때 **커밋 파일 목록에 application-oauth.properties**가 나오지 않으면 성공입니다.

## 3. 구글 로그인 연동하기
구글의 로그인 인증정보를 발급 받았으니 프로젝트 구현을 진행하겠습니다. 먼저 사용자 정보를 담당할 도메인인 User 클래스를 생성합니다.

> ```User 클래스 생성```
> ```java
>package com.swchoi.webservice.springboot.domain.user;
>
>import com.swchoi.webservice.springboot.domain.BaseTimeEntity;
>import lombok.Builder;
>import lombok.Getter;
>import lombok.NoArgsConstructor;
>
>import javax.persistence.*;
>
>@Getter
>@NoArgsConstructor
>@Entity
>public class User extends BaseTimeEntity {
>
>    @Id
>    @GeneratedValue(strategy = GenerationType.IDENTITY)
>    private Long id;
>
>    @Column(nullable = false)
>    private String name;
>
>    @Column(nullable = false)
>    private String email;
>
>    @Column
>    private String picture;
>
>    @Enumerated(EnumType.STRING)
>    @Column(nullable = false)
>    private Role role;
>
>    @Builder
>    public User(String name, String email, String picture, Role role) {
>        this.name = name;
>        this.email = email;
>        this.picture = picture;
>        this.role = role;
>    }
>
>    public User update(String name, String picture) {
>        this.name = name;
>        this.picture = picture;
>
>        return this;
>    }
>
>    public String getRoleKey() {
>        return this.role.getKey();
>    }
>}
> ```

1. @Enumerated(EnumType.STRING)
    - JPA로 데이터베이스로 저장할 때 Enum 값을 어떤 형태로 저장할지를 결정합니다.
    - 기본적으로 int로 숫자가 저장됩니다.
    - 숫자로 저장되면 데이터베이스로 확인할 때 그 값이 무슨 코드를 의미하는지 알 수가 없습니다.
    - 그래서 문자열(EnumType.STRING)로 지정될 수 있도록 선언합니다.

각 사용자의 권한을 관리할 Enum 클래스 Role을 생성합니다.    

> ```Role```
> ```java
>package com.swchoi.webservice.springboot.domain.user;
>
>import lombok.Getter;
>import lombok.RequiredArgsConstructor;
>
>@Getter
>@RequiredArgsConstructor
>public enum Role {
>
>    GUSET("ROLE_GUEST", "손님"),
>    USER("ROLE_USER", "일반 사용자");
>
>    private final String key;
>    private final String title;
>}
> ```

스프링 시큐리티에서는 권한 코드에 항상 **ROLE_이 앞에 있어야만** 합니다. 그래서 코드별 키 값을 ROLE_GUEST, ROLE_USER 등으로 지정합니다.

마지막으로 User의 CRUD를 책임질 UserRepository도 생성합니다.

> ```UserRepository```
> ```java
>package com.swchoi.webservice.springboot.domain.user;
>
>import org.springframework.data.jpa.repository.JpaRepository;
>
>import java.util.Optional;
>
>public interface UserRepository extends JpaRepository<User, Long> {
>
>    Optional<User> findByEmail(String email);
>}
> ```

1. **findByEmail**
    - 소셜 로그인으로 반환되는 값 중 email을 통해 이미 생성된 사용자인지 처음 가입하는 사용자인지 판단하기 위한 메소드입니다.

User 엔티티 관련 코드를 모두 작성했으니 본격적으로 시큐리티 설정을 진행하겠습니다.

### 스프링 시큐리티 설정
먼저 build.gradle에 스프링 시큐리티 관련 의존성 하나를 추가합니다.

> build.gradle
> ```
> compile('org.springframework.boot:spring-boot-starter-oauth2-client')
> ```

1. **spring-boot-starter-oauth2-client**
 - 소셜 로그인 등 클라이언트 입장에서 소셜 기능 구현 시 필요한 의존성
 - spring-boot-starter-oauth2-client와 spring-security-oauth2-jose를 기본으로 관리해줍니다.

build.gradle 설정이 끝났으면 OAuth 라이브러리를 이용한 소셜 로그인 설정 코드를 작성합니다.

- config.auth 패키지 생성
    - **시큐리티 관련 클래스는 모두 이곳에** 생성한다.
> ```패키지 생성```
> 
> <img src="../../images/spring/chater05/google8.png" width="50%" height="70%" title="OAuth" alt="OAuth"></img><br/>

#### SecurityConfig 클래스 생성
> ```SecurityConfig```
> ```java
>package com.swchoi.webservice.springboot.config.auth;
>
>import com.swchoi.webservice.springboot.domain.user.Role;
>import lombok.RequiredArgsConstructor;
>import org.springframework.security.config.annotation.web.builders.HttpSecurity;
>import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
>import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;
>
>@RequiredArgsConstructor
>@EnableWebSecurity
>public class SecurityConfig extends WebSecurityConfigurerAdapter {
>
>    private final CustomOAuth2UserService customOAuth2UserService;
>
>    @Override
>    protected void configure(HttpSecurity http) throws Exception {
>        http
>                .csrf().disable()
>                .headers().frameOptions().disable() 
>                .and()
>                    .authorizeRequests()
>                    .antMatchers("/", "/css/**", "/images/**",
>                            "/js/**", "/h2-console/**").permitAll()
>                    .antMatchers("/api/v1/**").hasRole(Role.
>                                                     USER.name())
>                    .anyRequest().authenticated()
>                .and()
>                    .logout()
>                        .logoutSuccessUrl("/")
>                .and()
>                    .oauth2Login()
>                        .userInfoEndpoint()
>                            .userService(customOAuth2UserService);
>    }
>}
> ```

#### 코드 설명
1. **@EnableWebSecurity**
    - Spring Security 설정들을 활성화시켜 줍니다.
2. **.csrf().disable().headers().frameOptions().disable()**
    - h2-console 화면을 사용하기 위해 해당 옵션들을 disable 합니다.
3. **authorizeRequests**
    - URL별 권한 관리를 설정하는 옵션의 시작점입니다.
    - authorizeRequests가 선언되어야만 antMatchers 옵션을 사용할 수 있습니다.
4. **antMatchers**
    - 권한 관리 대상을 지정하는 옵션입니다.
    - URL, HTTP 메소드별로 관리가 가능합니다.
    - "/"등 지정된 URL들은 permitAll() 옵션을 통해 전체 열람 권한을 주었습니다.
    - "/api/v1/**"주소를 가진 API는 USER 권한을 가진 사람만 가능하도록 했습니다.
5. **anyRequest**    
    - 설정된 값들 이외 나머지 URL들을 나타냅니다.
    - 여기서는 authenticated()을 추가하여 나머지 URL들은 모두 인증된 사용자들에게만 허용하게 됩니다.
    - 인증된 사용자 즉, 로그인한 사용자들은 이야기합니다.
6. **logout().logoutSuccessUrl("/")**
    - 로그아웃 기능에 대한 여러 설정의 진입점입니다.
    - 로그아웃 성공 시 / 주소로 이동합니다.
7. **oauth2Login**
    - OAuth 2 로그인 기능에 대한 여러 설정의 진입점입니다.
8. **userInfoEndpoint**
    - OAuth 2 로그인 성공 이후 사용자 정보를 가져올 때의 설정들을 담당합니다.
9. **userService**
    - 소셜 로그인 성공 시 후속 조치를 진행할 UserService 인터페이스의 구현체를 등록합니다.
    - 리소스 서버(즉, 소셜 서비스들)에서 사용자 정보를 가져온 상태에서 추가로 진행하고자 하는 기능을 명시할 수 있습니다.    

설정 코드 작성이 끝났다면 **CustomOAuth2UserService**클래스를 생성 합니다. 이 클래스에서는 구글 로그인 이후 가져온 사용자의 정보(email,name,picture등) 들을 기반으로 가입 및 정보수정, 세션 저장 등의 기능을 지원합니다.

> ```CustomOAuth2UserService```
> ```java
>package com.swchoi.webservice.springboot.config.auth;
>
>import com.swchoi.webservice.springboot.config.auth.dto.OAuthAttributes;
>import com.swchoi.webservice.springboot.config.auth.dto.SessionUser;
>import com.swchoi.webservice.springboot.domain.user.User;
>import com.swchoi.webservice.springboot.domain.user.UserRepository;
>import lombok.RequiredArgsConstructor;
>import org.springframework.security.core.authority.SimpleGrantedAuthority;
>import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
>import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
>import org.springframework.security.oauth2.client.userinfo.OAuth2UserService;
>import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
>import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
>import org.springframework.security.oauth2.core.user.OAuth2User;
>import org.springframework.stereotype.Service;
>
>import javax.servlet.http.HttpSession;
>import java.util.Collection;
>import java.util.Collections;
>
>@RequiredArgsConstructor
>@Service
>public class CustomOAuth2UserService implements OAuth2UserService<OAuth2UserRequest, OAuth2User> {
>    private final UserRepository userRepository;
>    private final HttpSession httpSession;
>
>    @Override
>    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
>        OAuth2UserService delegate = new DefaultOAuth2UserService();
>        OAuth2User oAuth2User = delegate.loadUser(userRequest);
>
>        String registrationId = userRequest.getClientRegistration().getRegistrationId();
>        String userNameAttributeName = userRequest.getClientRegistration()
>                .getProviderDetails().getUserInfoEndpoint().getUserNameAttributeName();
>
>        OAuthAttributes attributes = OAuthAttributes.
>                of(registrationId, userNameAttributeName, oAuth2User.getAttributes());
>
>        User user = saveOrUpdate(attributes);
>        httpSession.setAttribute("user", new SessionUser(user));
>
>        return new DefaultOAuth2User(
>                Collections.singleton(new SimpleGrantedAuthority(user.getRoleKey())),
>                attributes.getAttributes(),
>                attributes.getNameAttributeKey());
>    }
>
>    private User saveOrUpdate(OAuthAttributes attributes) {
>        User user = userRepository.findByEmail(attributes.getEmail())
>                .map(entity -> entity.update(attributes.getName(),attributes.getPicture()))
>                .orElse(attributes.toEntity());
>
>        return userRepository.save(user);
>    }
>}
> ```

#### 코드설명
1. **registrationId**
    - 현재 로그인 진행 중인 서비스를 구분하는 코드입니다.
    - 지금은 구글만 사용하는 불필요한 값이지만, 이후 네이버 로그인 연동시에 네이버 로그인인지, 구글 로그인인지 구분하기 위해 사용합니다.
2. **userNameAttributeName**     
    - OAuth2 로그인 진행 시 키가 되는 필드값을 이야기합니다. Primary Key와 같은 의미입니다.
    - 구글의 경우 기본적으로 코드를 지원하지만, 네이버 카카오 등은 기본 지원하지 않습니다. 구글의 기본 코드는 "sub"입니다.
3. **OAuthAttributes**
    - OAuth2UserService를 통해 가져온 OAuth2User의 attribute를 담을 클래스입니다.
    - 이후 네이버 등 다른 소셜 로그인도 이 클래스 사용합니다.
    - 바로 아래에서 이 클래스의 코드가 나오니 차례로 생성하시면 됩니다.
4. **SessionUser**
    - 세션에 사용자 정보를 저장하기 위한 Dto 클래스입니다.
    - 왜 **User 클래스를 쓰지 않고 새로 만들어서 쓰는지** 뒤이어서 상세하게 설명하겠습니다. 

구글 사용자 정보가 업데이트 되었을 때를 대비하여 **update** 기능도 같이 구현되었습니다. 사용자의 이름이나 프로필 사진이 변경되면 User엔티티에도 반영됩니다.


CustomOAuth2UserService 클래스까지 생성되었다면 OAuthAttributes 클래스를 생성합니다.

> ```OAuthAttributes```
> ```java
>package com.swchoi.webservice.springboot.config.auth.dto;
>
>import com.swchoi.webservice.springboot.domain.user.Role;
>import com.swchoi.webservice.springboot.domain.user.User;
>import lombok.Builder;
>import lombok.Getter;
>
>import java.util.Map;
>
>@Getter
>public class OAuthAttributes {
>    private Map<String, Object> attributes;
>    private String nameAttributeKey;
>    private String name;
>    private String email;
>    private String picture;
>
>    @Builder
>    public OAuthAttributes(Map<String, Object> attributes,
>                           String nameAttributeKey, String name,
>                           String email, String picture) {
>        this.attributes = attributes;
>        this.nameAttributeKey= nameAttributeKey;
>        this.name = name;
>        this.email = email;
>        this.picture = picture;
>    }
>
>    public static OAuthAttributes of(String registrationId,
>                                     String userNameAttributeName,
>                                     Map<String, Object> attributes) {
>        return ofGoogle(userNameAttributeName, attributes);
>    }
>
>    private static OAuthAttributes ofGoogle(String userNameAttributeName,
>                                            Map<String, Object> attributes) {
>        return OAuthAttributes.builder()
>                .name((String) attributes.get("name"))
>                .email((String) attributes.get("email"))
>                .picture((String) attributes.get("picture"))
>                .attributes(attributes)
>                .nameAttributeKey(userNameAttributeName)
>                .build();
>    }
>
>
>    public User toEntity() {
>        return User.builder()
>                .name(name)
>                .email(email)
>                .picture(picture)
>                .role(Role.GUSET)
>                .build();
>    }
>}
> ```

#### 코드설명
1. **of()**
    - OAuth2User에서 반환하는 사용자 정보는 Map이기 때문에 값 하나하나를 변환해야만 합니다.
2. **toEntity**
    - User 엔티티를 생성합니다.
    - OAuthAttributes에서 엔티티를 생성하는 시점은 처음 가입할 때입니다.
    - 가입할 때의 기본 권할을 GUEST로 주기 위해서 role 빌더값에는 Role.GUEST를 사용합니다.
    - OAuthAttributes 클래스 생성이 끝났으면 같은 패키지에 SessionUser 클래스를 생성합니다.

config.auth.dto 패키지에 **SessionUser** 클래스를 추가합니다.

> **SessionUser**
> ```java
>package com.swchoi.webservice.springboot.config.auth.dto;
>
>import com.swchoi.webservice.springboot.domain.user.User;
>import lombok.Getter;
>
>import java.io.Serializable;
>
>@Getter
>public class SessionUser implements Serializable {
>    private String name;
>    private String email;
>    private String picture;
>
>    public SessionUser(User user) {
>        this.name = user.getName();
>        this.email = user.getEmail();
>        this.picture = user.getPicture();
>    }
>}
> ```

SessionUser에는 **인증된 사용자 정보**만 필요합니다.

@Entity User 클래스를 SessionUser로 사용안하는 이유

세션에 저장하기 위해 User클래스를 세션에 저장하려고 하니 User 클래스에 **직렬화를 구현하지 않았다**는
에러가 난다. 
- Entity 클래스는 직렬화 코드를 넣지 않는게 좋다
- 엔티티 클래스에는 언제 다른 엔티티와 관계가 형성될지 모른다.
- @OneToMany, @ManyToMany등 자식 엔티티를 갖고 있다면 직렬화 대상에 자식들까지 포함되니 **성능 이슈, 부수 효과**가 발생할 확률이 높다
그래서 **직렬화 기능을 가진 세션 Dto**를 하나 추가로 만든 것이 더 좋은 방법이다.

### 로그인 테스트
스프링 시큐리티가 잘 적용되었는지 확인하기 위해 화면에 로그인 버튼을 추가해보자

> **index.mustache** 수정
> ```html
>{{>layout/header}}
>    <h1>스프링 부트로 시작하는 웹 서비스</h1>
>    <div class="col-md-12">
>        <!--로그인 기능 영역-->
>        <div class="row">
>            <div class="col-md-6">
>                <a href="/posts/save" role="button" class="btn btn-primary">글 등록</a>
>                {{#userName}}
>                    Logged in as : <span id="user">{{username}}</span>
>                    <a href="/logout" class="btn btn-info active" role="button">Logout</a>
>                {{/userName}}
>                {{^userName}}
>                    <a href="/oauth2/authorization/google" class="btn btn-success active" role="button">Google Login</a>
>                {{/userName}}
>            </div>
>        </div>
>    </div>
>    <br>
>    <!-- 목록 출력 영역 -->
>	...
>{{>layout/footer}}
> ```
```
코드설명
1. {{#userName}}
    - 머스테치는 다른 언어와 같은 if문(if userName != null)을 제공하지 않습니다.
    - true/false 여부만 판단할 뿐입니다.
2. a href="/logout"
    - 스프링 시큐리티에서 기본적으로 제공하는 로그아웃 URL입니다.
    - 즉, 개발자가 별도로 저 URL에 해당하는 컨트롤러를 만들 필요가 없습니다.
    - SecurityConfig 클래스에서 URL을 변경할 수 있다.    
3. {{^userName}}
    - 머스테치에서 해당 값이 존재하지 않는 경우에는 ^를 사용합니다.
4. a href="/oauth2/authorization/google"
    - 스프링 시큐리티에서 기본적으로 제공하는 로그인 URL입니다.
    - 로그아웃 URL과 마찬가지로 개발자가 별도의 컨트롤러를 생성할 필요가 없습니다.    
```
index.mustache에서 userName을 사용할 수 있게 IndexController에서 userName을 추가합니다.

> ```IndexController```
> ```java
>import javax.servlet.http.HttpSession;
>
>@RequiredArgsConstructor
>@Controller
>public class IndexController {
>
>    private final PostService postService;
>    private final HttpSession httpSession;
>
>    @GetMapping("/")
>    public String index(Model model) {
>        model.addAttribute("posts", postService.findAllDesc());
>
>        SessionUser user = (SessionUser) httpSession.getAttribute("user");
>
>        if(user != null){
>            model.addAttribute("userName", user.getName());
>        }
>
>        return "index";
>    }
>	...
>}
> ```

#### 코드 설명
1. (SessionUser) httpSession.getAttribute("user")
    - 앞서 작선된 CustomOAuth2UserService에서 로그인 성공 시 세션에 SessionUser를 저장하도록 구성했습니다.
    - 즉, 로그인 성공시 httpSerssion.getAttribute("user")에서 값을 가져올 수 있습니다.
2. if(user != null)
    - 세션에 저장된 값이 있을 때만 model에 userName으로 등록

그럼 한번 로그인 테스트를 진행하겠습니다.

> ```로그인 버튼```
> 
> <img src="../../images/spring/chater05/google9.png" width="70%" height="70%" title="OAuth" alt="OAuth"></img><br/>
> ```구글 로그인 버튼 클릭```
>
> <img src="../../images/spring/chater05/google10.png" width="70%" height="70%" title="OAuth" alt="OAuth"></img><br/>
> ```구글 로그인 성공```
>
> <img src="../../images/spring/chater05/google11.png" width="70%" height="70%" title="OAuth" alt="OAuth"></img><br/>
> 회원가입도 잘 되어 있는지 확인 -> http://loaclhost:8080/h2-console 접속
>
> <img src="../../images/spring/chater05/google12.png" width="100%" height="70%" title="OAuth" alt="OAuth"></img><br/>

데이터베이스에 정상적으로 회원정보가 들어간 것까지 확인했습니다. 또한 권한관리도 잘되는지 확인해 보겠습니다. 현재 로그인 사용자의 권한(ROLE)은 GUEST입니다. 이 상태에서는 posts 기능을 전혀 쓸 수 없습니다. 실제 글 등록 기능으 사용해보겠습니다.

> ```게시글 등록 실패```
>
> <img src="../../images/spring/chater05/google13.png" width="80%" height="70%" title="OAuth" alt="OAuth"></img><br/>
> 403(권한 거부) 에러가 발생한 것을 볼 수 있습니다.
> ```사용자 권한 변경```
> ```
> update user set role = 'USER';
> ```
> ```권한 변경 후 등록 성공```
>
> <img src="../../images/spring/chater05/google14.png" width="80%" height="70%" title="OAuth" alt="OAuth"></img><br/>

기본적인 구글 로그인,로그아웃,회원가입,권한관리 기능이 모두 구현 되었습니다.