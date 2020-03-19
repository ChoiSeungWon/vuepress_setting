# Mustache로 화면 구성하기

## 1.mustache
- Logic-less template Engine
- 다양한 언어들을 지원 (Ruby, JavaScript, Python, Erlang, node.js, PHP, Perl, Objective-C, Java, .NET, Android, C++, Go, 
Lua, ooc, ActionScript, ColdFusion, Scala, Clojure, Fantom, CoffeeScript, D, Haskell, XQuery, ASP, Io, Dart, Haxe, and for Delphi)
- 수많은 언어를 지원한느 가장 심플한 템플릿 엔진

### Template Engine?
- 템플릿 엔진은 "프로그램 로직" <-> "프리젠테이션" 계층을 분리하기 위한 수단
- 예를 들어 Controller -> View로 데이터를 던지면 어떻게 계층을 분리하여 쉽게 표현할지를 도와주는 "도구"
- 프리젠테이션 계층에서 로직을 쉽게 표현하고 개발의 유연성을 향상 시킴 & 유지보수 효율 향상 

자바 진영에서는 JSP, Velocity, Freemarker, Thymeleaf 등 다양한 서버 템플릿 엔진이 존재

#### 다른 템플릿 엔진의 단점
- **JSP,Velocatity**: 스프링 부트에서는 권장하지 않는 템플릿 엔진입니다.
- **Freemarker** : 템플릿 엔진으로는 너무 과하게 많은 기능으 지원한다. 
- **Thymeleaf** : 스프링 진영에서 적극적으로 밀고 있지만 문법이 어렵다.


#### 머스테치의 장점
- 문법이 다른 템플릿 엔진보다 심플하다.
- 로직 코드를 사용할 수 없어 View의 역할과 서버의 역할을 명확하게 분리된다.

#### 머스테치 플러그인 설치
![mustache](../../images/spring/chater04/mustache1.png)

## 2. 기본 페이지 만들기
가장 먼저 스프링 부트 프로젝트에서 머스테치를 사용할 수 있도록 의존성을 build.gradle에 등록한다.
> ```
> compile('org.springframework.boot:spring-boot-starter-mustache')
> ```

보는 것처럼 머스테치는 **스프링 부투에서 공식 지원하는 템플릿 엔진**입니다.

- 머스테치의 파일 위치는 기본적으로 **src/main/resources/templates** 입니다.
> ![templates](../../images/spring/chater04/mustache2.png)
> 
> **index.mustache**
> ```html
><!DOCTYPE HTML>
><html>
><head>
>    <title>스프링 부트 웹서비스</title>
>    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
>
></head>
><body>
>    <h1>스프링 부트로 시작하는 웹 서비스</h1>
></body>
></html>
> ``` 
> **IndexController**
> ```java
>package com.swchoi.webservice.springboot.web;
>
>import org.springframework.stereotype.Controller;
>import org.springframework.web.bind.annotation.GetMapping;
>
>@Controller
>public class IndexController {
>
>    @GetMapping("/")
>    public String index() {
>        return "index";
>    }
>}
> ```

머스테치 스타터 덕분에 컨트롤러에서 문자열을 반환할 때 **앞의 경로와 뒤의 파일 확장자는 자동으로 지정** 됩니다.

> **IndexControllerTest**
> ```java
>package com.swchoi.webservice.springboot.web;
>
>import org.junit.Test;
>import org.junit.runner.RunWith;
>import org.springframework.beans.factory.annotation.Autowired;
>import org.springframework.boot.test.context.SpringBootTest;
>import org.springframework.boot.test.web.client.TestRestTemplate;
>import org.springframework.test.context.junit4.SpringRunner;
>
>import static org.assertj.core.api.Assertions.assertThat;
>import static org.springframework.boot.test.context.SpringBootTest.WebEnvironment.RANDOM_PORT;
>
>@RunWith(SpringRunner.class)
>@SpringBootTest(webEnvironment = RANDOM_PORT)
>public class IndexControllerTest {
>
>    @Autowired
>    private TestRestTemplate restTemplate;
>
>    @Test
>    public void 메인페이지_로딩() {
>        //when
>        String body = this.restTemplate.getForObject("/", String.class);
>
>        //then
>        assertThat(body).contains("스프링 부트로 시작하는 웹 서비스");
>    }
>}
> ```
> **테스트 결과**
>
> ![tset](../../images/spring/chater04/mustache3.png)
> 
> **브러우저 확인**
>
> ![tset](../../images/spring/chater04/mustache4.png)

## 3. 게시글 등록 화면 만들기

#### 공통 레이아웃 작성

src/main/resources/tmeplates 디렉토리에 layout 디렉토리를 추가로 생성합니다.
그리고 footer.mustache, header.mustache 파일을 생성합니다.

![layout](../../images/spring/chater04/mustache5.png)

> **header.mustache**
> ```html
><!DOCTYPE HTML>
><html>
><head>
>    <title>스프링 부트 웹서비스</title>
>    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8"/>
>    <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css">
></head>
><body>
> ```
> **footer.mustache**
> ```html
><script src="https://code.jquery.com/jquery-3.3.1.min.js"></script>
><script src="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/js/bootstrap.min.js"></script>
></body>
></html>
> ```
> 부트스트랩, 제이쿼리 라이브러리 사용

```
    1. {{>layout/hader}}
        - {{>}}는 현재 머스테치 파일을 기준으로 다른 파일을 가져옵니다.
```

#### 게시글 등록 화면

> **index.mustache** 메인 페이지 수정
> ```html
>{{>layout/header}}
>    <h1>스프링 부트로 시작하는 웹 서비스</h1>
>    <div class="col-md-12">
>        <div class="row">
>            <div class="col-md-6">
>                <a href="/posts/save" role="button" class="btn btn-primary">글 등록</a>
>            </div>
>        </div>
>    </div>
>{{>layout/footer}}
> ```
>
> **IndexController** 게시글 등록 화면 이동 컨트롤러 작성
> ```java
>@Controller
>public class IndexController {
>	...
>
>    @GetMapping("/posts/save")
>    public String postsSave() {
>        return "posts-save";
>    }
>}
> ```
> **posts-save.mustache** 게시글 등록 화면 생성
> ```html
>{{>layout/header}}
>
><h1>게시글 등록</h1>
>
><div class="col-md-12">
>    <div class="col-md-4">
>        <form>
>            <div class="form-group">
>                <label for="title">제목</label>
>                <input type="text" class="form-control" id="title" placeholder="제목을 입력하세요">
>            </div>
>            <div class="form-group">
>                <label for="author">작성자</label>
>                <input type="text" class="form-control" id="author" placeholder="작성자를 입력하세요">
>            </div>
>            <div class="form-group">
>                <label for="content">내용</label>
>                <textarea class="form-control" id="content" placeholder="내용을 입력하세요"></textarea>
>            </div>
>        </form>
>        <a href="/" role="button" class="btn btn-secondary">글 취소</a>
>        <button type="button" class="btn btn-primary" id="btn-save">등록</button>
>    </div>
></div>
>{{>layout/footer}}
> ```
> **글 등록 화면**
>
> <img src="../../images/spring/chater04/mustache6.png" width="50%" height="70%" title="posts-save" alt="posts-save"></img><br/>

#### index.js 생성

![index.js](../../images/spring/chater04/mustache7.png)

> **index.js**
> ```javascript
>var main = {
>    init : function () {
>        var _this = this;
>        $('#btn-save').on('click', function () {
>            _this.save();
>        })
>    },
>    save : function () {
>        var data = {
>            title : $("#title").val(),
>            author : $("#author").val(),
>            content : $("#content").val()
>        };
>
>        $.ajax({
>            type : 'POST',
>            url : '/api/v1/posts',
>            dataType : 'json',
>            contentType : 'application/json; charset=utf-8',
>            data : JSON.stringify(data)
>        }).done(function () {
>            alert('글이 등록되었습니다.');
>            window.location.href = '/';
>        }).fail(function (error) {
>            alert(JSON.stringify(error));
>        })
>    }
>};
>
>main.init();
> ```

#### 게시글 등록 확인

> **등록 성공 alert**
>
> <img src="../../images/spring/chater04/mustache8.png" width="100%" height="70%" title="posts-save" alt="posts-save"></img><br/>
> **등록 데이터베이스 확인**
>
> <img src="../../images/spring/chater04/mustache9.png" width="100%" height="70%" title="posts-save" alt="posts-save"></img><br/>


## 4. 전체 조회 화면 만들기

전체 조희를 위해 index.mustache의 UI를 변경하겠습니다.

> **index.mustache** 
> ```html
>{>layout/header}}
>   <h1>스프링 부트로 시작하는 웹 서비스</h1>
>   <div class="col-md-12">
>       <div class="row">
>           <div class="col-md-6">
>               <a href="/posts/save" role="button" class="btn btn-primary">글 등록</a>
>           </div>
>       </div>
>   </div>
>   <br>
>   <!-- 목록 출력 영역 -->
>   <table class="table table-horizontal table-bordered">
>       <thead class="thead-strong">
>       <tr>
>           <th>게시글 번호</th>
>           <th>제목</th>
>           <th>작성자</th>
>           <th>최종수정일</th>
>       </tr>
>       </thead>
>       <tbody id="tbody">
>       {{#posts}}
>           <tr>
>               <td>{{id}}</td>
>               <td>{{title}}</td>
>               <td>{{author}}</td>
>               <td>{{modifiedDate}}</td>
>           </tr>
>       {{/posts}}
>       </tbody>
>   </table>
>{>layout/footer}}
> ```

```
1. {{#posts}}
    - posts 라는 List를 순회
2. {{id}} 등의 {{변수명}}
    - List에서 뽑아낸 객체의 필드를 사용합니다.
```

그럼 Controller, Service, Repository 코드를 작성하겠습니다.

> **PostsRepository**
> ```java
>import java.util.List;
>
>public interface PostsRepository extends JpaRepository<Posts, Long> {
>
>    @Query("SELECT p From Posts p ORDER BY p.id DESC")
>    List<Posts> findAllDesc();
>}
> ```

SpringDataJpa에서 제공하지 않는 메소드는 위처럼 쿼리로 작성핻 되는 것으 보여드리고자 @Query를 사용했습니다.

실제로 앞의 코드는 SpringDataJpa에서 제공하는 기본 메소드만으로 해결할 수있습니다. 다만 @Query가 훨씬 가독성이 좋으니 선택해서 사용하면 됩니다.

#### 참고
규모가 있는 프로젝트에서의 데이터 조회는 FK의 조인, 복잡한 조건 등으로 인해 이런 Entity 클래스만으로 처리하기 어려워 조회용 프레임워크를 추가로 사용한다.

대표적인 예로 ```querydsl,jooq, MyBatis``` 등이 있습니다. 조회는 위 3가지 프레임워크 중 하나를 통해 조회하고, 등록/수정/삭제 등은 SpringDataJpa를 통해 진행합니다.

**Querydsl을 추천하는 이유**

1. 타입 안정성이 보장된다.
    - 단순한 문자열로 쿼리를 생성하는 것이 아니라, 메소드를 기반으로 쿼리를 생성하기 때문에 오타나 존재하지 않는 컬러명을 명시할 경우 IDE에서 자동으로 검출됩니다. 이 장점은 Jooq에서도 지원하는 장점이자만, MyBatis에서는 지원하지 않습니다.

2. 국내 많은 회사에서 사용중입니다.
    - 쿠팡, 배민 등 JPA를 적극적으로 사용하는 회사에서는 ```Querydsl```를 적극적으로 사용중입니다.

3. 레퍼런스가 많습니다.
    - 앞 2번의 장점에서 이어지는 것인데, 많은 회사와 개발자들이 사용하다보니 그만큼 국내 자료가 많다.

Repositroy 다음으로 PostsService에 코드를 추가하겠습니다.

> **PostService**
> ```java
>import java.util.List;
>import java.util.stream.Collectors;
>
>@RequiredArgsConstructor
>@Service
>public class PostService {
>	...
>
>    @Transactional(readOnly = true)
>    public List<PostsListResponseDto> findAllDesc() {
>        return postsRepository.findAllDesc().stream()
>                .map(PostsListResponseDto::new)
>                .collect(Collectors.toList());
>    }
>}
> ```

findAllDesc 메소드의 트랜잭션 어노테이션(@Transcational)에 옵셥이 하나 추가되었습니다.
(readOnly = true)를 주면 **트랜잭션 범위는 유지**하되, 조회 기능만 남겨두어 **조회 속도가 개선**되기 때문에 등록, 수정, 삭제 기능이 전혀 없는 서비스 메소드에서 사용하는 것을 추천합니다.

아직 PostsListResponseDto 클래스가 없기 때문에 이 클래스 역시 생성합니다.

> **PostsListResponseDto**
> ```java
>package com.swchoi.webservice.springboot.web.dto;
>
>import com.swchoi.webservice.springboot.domain.posts.Posts;
>import lombok.Getter;
>
>import java.time.LocalDateTime;
>
>@Getter
>public class PostsListResponseDto {
>    private Long id;
>    private String title;
>    private String author;
>    private LocalDateTime modifiedDate;
>
>    public PostsListResponseDto(Posts entity) {
>        this.id = entity.getId();
>        this.title = entity.getTitle();
>        this.author = entity.getAuthor();
>        this.modifiedDate = entity.getModifiedDate();
>    }
>}
> ```

마지막으로 Controller를 변경하겠습니다.

> ``` IndexController ```
> ```java
>package com.swchoi.webservice.springboot.web;
>
>import com.swchoi.webservice.springboot.service.posts.PostService;
>import lombok.RequiredArgsConstructor;
>import org.springframework.stereotype.Controller;
>import org.springframework.ui.Model;
>import org.springframework.web.bind.annotation.GetMapping;
>
>@RequiredArgsConstructor
>@Controller
>public class IndexController {
>
>    private final PostService postService;
>
>    @GetMapping("/")
>    public String index(Model model) {
>        model.addAttribute("posts", postService.findAllDesc());
>        
>        return "index";
>    }
>
>    @GetMapping("/posts/save")
>    public String postsSave() {
>        return "posts-save";
>    }
>}
> ```

1. **Model**
    - 서버 템플릿 엔진에서 사용할 수 있는 객체를 지정할 수 있습니다.
    - 여기서는 postService.findAllDesc()로 가져온 결과를 posts로 index.muistache에 전달합니다.

Controller까지 모두 완성되었습니다. http://localhost:8080/로 접속한 뒤 등록 화면을 이용해 하나의 데이터를 등록해 봅니다.    

> ```조회 목록```
>
> <img src="../../images/spring/chater04/mustache10.png" width="100%" height="70%" title="posts-save" alt="posts-save"></img><br/>

## 5. 게시글 수정, 삭제 화면 만들기

### 게시글 수정
게시글 수정 화면 메스테치 파일을 생성합니다.

> ```post-update.mustache```
> ```html
>{{>layout/header}}
>
><h1>게시글 수정</h1>
>
><div class="col-md-12">
>    <div class="col-md-4">
>        <form>
>            <div class="form-group">
>                <label for="title">글번호</label>
>                <input type="text" class="form-control" id="id"value="{{post.id}}" readonly>
>            </div>
>            <div class="form-group">
>                <label for="title">제목</label>
>                <input type="text" class="form-control" id="title" value="{{post.title}}">
>            </div>
>            <div class="form-group">
>                <label for="author"> 작성자 </label>
>                <input type="text" class="form-control" id="author" value="{{post.author}}" readonly>
>            </div>
>            <div class="form-group">
>                <label for="content"> 내용 </label>
>                <textarea class="form-control" id="content">{{post.content}}</textarea>
>            </div>
>        </form>
>        <a href="/" role="button" class="btn btn-secondary">취소</a>
>        <button type="button" class="btn btn-primary" id="btn-update">수정</button>
>    </div>
></div>
>
>{{>layout/footer}}
> ```

```
1. {{post.id}}
 - 머스테치는 객체의 필드 접근 시 점(Dot)으로 구분합니다.
 - 즉, Post 클래스 id에 대한 접근은 post.id로 사용할 수 있습니다.
2. readonly
 - input 태그에 읽기 가능만 허용하는 속성입니다.
 - id와 author는 수정할 수 없도록 읽기만 허용하도록 추가합니다.
```

그리고 btn-update 버튼을 클릭하면 update 기능을 호출할 수 있게 index.js 파일에도 update function을  추가합니다.

> **index.js**
> ```javascript
>var main = {
>    init : function () {
>        var _this = this;
>
>        $('#btn-save').on('click', function () {
>            _this.save();
>        });
>
>        $("#btn-update").on('click', function () {
>            _this.update();
>        });
>    },
>    save : function () {
>		...
>    },
>    update : function () {
>        var date = {
>            title : $("#title").val(),
>            content : $("#content").val()
>        };
>
>        var id = $("#id").val();
>
>        $.ajax({
>            type : 'PUT',
>            url : '/api/v1/posts/'+ id,
>            dataType : 'json',
>            contentType : 'application/json; charset=utf-8',
>            data : JSON.stringify(data)
>        }).done(function () {
>            alert('글이 수정되었습니다.');
>            window.location.href = '/';
>        }).fail(function (error) {
>            alert(JSON.stringify(error));
>        });
>
>    }
>};
>
>main.init();
>

1. **$("#btn-update").on('click')**
    - btn-update란 id를 가진 HTML 엘리먼트에 click 이벤트가 발생할때 update function을 실행하도록 이벤트를 등록한다.
2. **update : function()**
    - 신규로 추가될 update function입니다.

3. **type:'PUT'**        
    - 여러 HTTP Method 중 PUT 메소드를 선택합니다.
    - REST에서 CRUD는 다음과 같이 HTTP Method에 매핑됩니다.
        - 생성(Create) - POST
        - 읽기(Read)   - GET
        - 수정(Update) - PUT
        - 삭제(Delete) - DELETE

수정 페이지로 이동할 수 있게 페이지 이동 기능을 추가해 보겠습니다.
> index.mustache 수정
> ```html
>        <tbody id="tbody">
>        {{#posts}}
>            <tr>
>                <td>{{id}}</td>
>                <td><a href="/posts/update/{{id}}">{{title}}</a></td>
>                <td>{{author}}</td>
>                <td>{{modifiedDate}}</td>
>            </tr>
>        {{/posts}}
>        </tbody>
> ```
> IndexController postsUpdate 추가
> ```java
>@RequiredArgsConstructor
>@Controller
>public class IndexController {
>
>	...
>
>    @GetMapping("/posts/update/{id}")
>    public String postsUpdate(@PathVariable Long id, Model model){
>
>        PostsResponseDto dto = postService.findById(id);
>        model.addAttribute("post", dto);
>
>        return "posts-update";
>    }
>}
> ```
> 제목과 내용 수정
> <img src="../../images/spring/chater04/mustache11.png" width="100%" height="70%" title="posts-save" alt="posts-save"></img><br/>
> 

### 게시글 삭제
수정 기능이 정상적으로 구현되었으니, 삭제 기능도 구현해 봅시다.
본문을 확인하고 진행해야 하므로, 수정 화면에 추가하겠습니다.

> ```posts-update.mustache```
> ```html
> ...
><div class="col-md-12">
>    <div class="col-md-4">
>		...
>        <a href="/" role="button" class="btn btn-secondary">취소</a>
>        <button type="button" class="btn btn-primary" id="btn-update">수정</button>
>        <button type="button" class="btn btn-danger" id="btn-delete">삭제</button>
>    </div>
></div>
> ...
> ```
1. btn-delete
    - 해당 버튼 클릭스 js에서 이벤트를 수신할 예정입니다.

삭제 이벤트를 진행할 js코드를 추가합니다.

>```index.js``` delete 함수 추가
> ```javascript
>var main = {
>    init : function () {
>        var _this = this;
>		...
>
>        $("#btn-delete").on('click', function () {
>            _this.delete();
>        });
>    },
>	...
>    delete : function () {
>        var id = $("#id").val();
>
>        $.ajax({
>            type : 'DELETE',
>            url : '/api/v1/posts/'+ id,
>            dataType : 'json',
>            contentType : 'application/json; charset=utf-8'
>        }).done(function () {
>            alert('글이 삭제되었습니다.');
>            window.location.href = '/';
>        }).fail(function (error) {
>            alert(JSON.stringify(error));
>        });
>    }
>};
>
>main.init();
> ```
> ```PostService``` delete 메소드 추가
> ```java
>@RequiredArgsConstructor
>@Service
>public class PostService {
>    private final PostsRepository postsRepository;
>
>    ...
>
>    @Transactional
>    public void delete (Long id) {
>        Posts posts = postsRepository.findById(id)
>                .orElseThrow(() -> new IllegalArgumentException("해당 게시글이 없습니다 id=" + id));
>
>        postsRepository.delete(posts);
>    }
>}
> ```

1. postsRepository.delete(posts)
    - JpaRepository에서 이미 delete 메소드를 지원하고 있으니 이를 활용합니다.
    - 엔티티를 파라미터로 삭제할 수도 있고, deleteById 메소드를 이용하면 id를 삭제할 수도 있습니다.
    - 존재하는 Posts인지 확인을 위해 엔티티 조회 후 그대로 삭제합니다.

> ```PostsApiController``` delete 메소드 추가
> ```java
>@RequiredArgsConstructor
>@RestController
>public class PostsApiController {
>
>    private final PostService postService;
>
>	...
>
>    @DeleteMapping("/api/v1/posts/{id}")
>    public Long delete(@PathVariable Long id) {
>        postService.delete(id);
>        return id;
>    }
>}
> ```   
> 삭제
> <img src="../../images/spring/chater04/mustache11.png" width="100%" height="70%" title="posts-save" alt="posts-save"></img><br/>
> 

기본적인 게시판 기능 완성되었습니다.