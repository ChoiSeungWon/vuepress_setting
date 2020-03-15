
module.exports = {
    home : true,
    title : "SeungWon 기술블로그",
    description : 'Just playing around',
    base : '/about-me/',
    themeConfig: {
        repo: 'ChoiSeungWon/about-me',
        editLinks: true,
        docsDir: 'docs',
        lastUpdated: 'Last Updated',
        search: true,
        sidebarDepth: 3,
        nav: [
            {
                text: 'Home',
                link: '/'
            },
            {
                text: 'Tech',
                link: '/tech/'
            },
            {
                text: 'about',
                link: '/swchoi/'
            },
        ],
        sidebar: {
            '/tech/': [{
                title: 'Tech',
                collapsable: true,
                children: [
                    '/tech/vuepress/',
                    '/tech/markdown/',
                    '/tech/springbatch/SpringBatch',
                    '/tech/spring-project/springNav'
                ]
            }],
            '/spring/': [{
                title: '스프링 부트와 AWS로 혼자 구현하는 웹 서비스',
                collapsable: true,
                children: [
                    '/spring/chater01/',
                    '/spring/chater02/',
                    '/spring/chater03/'
                ]
            }]
        }
    }
}